import * as admin from "firebase-admin";
import * as fs from "fs-extra";
// @ts-ignore
import * as Hash from "ipfs-only-hash";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import { WaveFile } from "wavefile";

import ffmpeg = require("fluent-ffmpeg");
import ffmpegPath = require("ffmpeg-static");

// Configure ffmpeg with static binary
ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

const TEMPORARY_AUDIO_COLLECTION = "temporary_audio";

interface AudioProcessingResults {
  loselessAudioPath: string;
  calculatedAudioIPFSHash: string;
  generatedMP3HighQualityAudioPath: string;
  generatedMP3LowQualityAudioPath: string;
  generatedWaveformJSONPath: string;
  generatedWaveformSVGPath: string;
}

export class AudioProcessor {
  static getBucket() {
    return admin.storage().bucket();
  }

  static async processAudio(object: any): Promise<void> {
    const filePath = object.name; // e.g., tmp/seed-name-time

    // Only process files in tmp/ folder
    if (!filePath.startsWith("tmp/")) {
      console.log("Not a temporary file, skipping processing.");
      return;
    }

    const fileName = path.basename(filePath);
    const workingDir = path.join(os.tmpdir(), "audio_processing_" + Date.now());

    // Download file to local temp
    const tempLocalFile = path.join(workingDir, fileName);

    try {
      await fs.ensureDir(workingDir);

      console.log(`Downloading ${filePath} to ${tempLocalFile}`);
      await this.getBucket().file(filePath).download({ destination: tempLocalFile });

      const audioBuffer = await fs.readFile(tempLocalFile);

      // Prepare working directory for this track
      const trackDirectory = path.join(workingDir, "track_data");
      await fs.ensureDir(trackDirectory);

      // 1. Normalize to WAV
      const { normalizedAudioBuffer, normalizedAudioPath } = await this.normalizeAudioToWAV(
        trackDirectory,
        audioBuffer,
      );

      // 2. Analyze silence
      const waveFile = new WaveFile();
      waveFile.fromBuffer(normalizedAudioBuffer);

      if (await this.isWaveFileSilent(waveFile)) {
        console.error("Audio detected as silent");
        await this.updateAudioProcessingStatus(fileName, "failed", "");
        return;
      }

      // 3. Calculate IPFS Hash
      const calculatedAudioIPFSHash =
        await this.calculateIPFSHashFromWAVAudio(normalizedAudioBuffer);

      // 4. Check for duplicates
      const isAudioAlreadyProcessed = await this.isAudioAlreadyProcessed(calculatedAudioIPFSHash);

      if (isAudioAlreadyProcessed) {
        console.log("Audio already processed, updating status only.");
        await this.updateAudioProcessingStatus(fileName, "ready", calculatedAudioIPFSHash);
        return;
      }

      // 5. Generate derivatives
      const generatedMP3HighQualityAudioPath = await this.generateMP3HighQualityAudio(
        normalizedAudioBuffer,
        trackDirectory,
      );

      const generatedMP3LowQualityAudioPath = await this.generateMP3LowQualityAudio(
        normalizedAudioBuffer,
        trackDirectory,
      );

      const generatedWaveformJSONPath = await this.generateWaveformJSON(waveFile, trackDirectory);
      const generatedWaveformSVGPath = await this.generateWaveformSVG(waveFile, trackDirectory);

      const results: AudioProcessingResults = {
        loselessAudioPath: normalizedAudioPath,
        calculatedAudioIPFSHash,
        generatedMP3HighQualityAudioPath,
        generatedMP3LowQualityAudioPath,
        generatedWaveformJSONPath,
        generatedWaveformSVGPath,
      };

      // 6. Upload results
      await this.saveAudioToDatabaseAndBucket(results);

      // 7. Update status
      await this.updateAudioProcessingStatus(fileName, "ready", calculatedAudioIPFSHash);

      // 8. Cleanup: Delete original file from tmp/ in Storage (Optional)
      // await this.getBucket().file(filePath).delete();
    } catch (error) {
      console.error("Error processing audio:", error);
      await this.updateAudioProcessingStatus(fileName, "failed", "");
    } finally {
      // Clean up local temp files
      await fs.remove(workingDir);
    }
  }

  // --- Private Methods ---

  private static async normalizeAudioToWAV(trackDirectory: string, audioBuffer: Buffer) {
    const normalizedLocalPath = path.join(trackDirectory, "normalized.wav");
    const stream = this.bufferToStream(audioBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(stream)
        .inputOptions([])
        .outputOptions(["-bitexact", "-acodec pcm_s16le", "-ar 44100", "-ac 2"])
        .output(normalizedLocalPath)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });

    const normalizedAudioBuffer = await fs.readFile(normalizedLocalPath);
    return { normalizedAudioBuffer, normalizedAudioPath: normalizedLocalPath };
  }

  private static async generateMP3HighQualityAudio(buffer: Buffer, dir: string): Promise<string> {
    const outputPath = path.join(dir, "audio.mp3");
    const stream = this.bufferToStream(buffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(stream)
        .outputOptions(["-vn", "-ar 44100", "-ac 2", "-b:a 192k"])
        .output(outputPath)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });
    return outputPath;
  }

  private static async generateMP3LowQualityAudio(buffer: Buffer, dir: string): Promise<string> {
    const outputPath = path.join(dir, "audio-low.mp3");
    const stream = this.bufferToStream(buffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(stream)
        .outputOptions(["-vn", "-codec:a libmp3lame", "-q:a 7"])
        .output(outputPath)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });
    return outputPath;
  }

  private static async saveAudioToDatabaseAndBucket(results: AudioProcessingResults) {
    const bucket = this.getBucket();
    const basePath = `audio/${results.calculatedAudioIPFSHash}`;

    const upload = async (localPath: string, destName: string) => {
      await bucket.upload(localPath, { destination: `${basePath}/${destName}` });
    };

    await Promise.all([
      upload(results.generatedMP3HighQualityAudioPath, "audio.mp3"),
      upload(results.generatedMP3LowQualityAudioPath, "audio-low.mp3"),
      upload(results.generatedWaveformSVGPath, "waveform.svg"),
      upload(results.generatedWaveformJSONPath, "waveform.json"),
      upload(results.loselessAudioPath, "audio.wav"),
    ]);
  }

  private static async updateAudioProcessingStatus(fileName: string, status: string, hash: string) {
    // Ensure fileName is treated as the doc ID
    await admin.firestore().collection(TEMPORARY_AUDIO_COLLECTION).doc(fileName).set(
      {
        status,
        hash,
        updated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  private static async isWaveFileSilent(waveFile: WaveFile): Promise<boolean> {
    const samples = waveFile.getSamples();
    // @ts-ignore
    const samplesArray = Array.isArray(samples) ? (samples[0] as number[]) : [];

    // Handle TypedArray
    const arr =
      samplesArray instanceof Float64Array ||
      samplesArray instanceof Int16Array ||
      samplesArray instanceof Int32Array
        ? Array.from(samplesArray)
        : samplesArray;

    const silentThreshold = 100;
    if (arr.length === 0) return true;

    // Optimization: check 1 sample every 100
    return arr.every((sample: number, i: number) =>
      i % 100 === 0 ? Math.abs(sample) < silentThreshold : true,
    );
  }

  private static async calculateIPFSHashFromWAVAudio(buffer: Buffer): Promise<string> {
    return await Hash.of(buffer);
  }

  private static async isAudioAlreadyProcessed(hash: string): Promise<boolean> {
    const [exists] = await this.getBucket().file(`audio/${hash}/audio.wav`).exists();
    return exists;
  }

  private static async generateWaveformJSON(waveFile: WaveFile, dir: string): Promise<string> {
    const data = this.makeWaveData(waveFile);
    const pathJson = path.join(dir, "waveform.json");
    await fs.writeFile(pathJson, JSON.stringify(data));
    return pathJson;
  }

  private static async generateWaveformSVG(waveFile: WaveFile, dir: string): Promise<string> {
    const data = this.makeWaveData(waveFile);
    const samples = data.map((v) => parseFloat(v));
    const svg = await this.makeWaveTrace(samples);
    const pathSvg = path.join(dir, "waveform.svg");
    await fs.writeFile(pathSvg, svg);
    return pathSvg;
  }

  private static makeWaveData(wav: WaveFile, resolution = 1200): string[] {
    const allChannels = wav.getSamples();
    // @ts-ignore
    const channelSamples = allChannels[0] || [];

    // Ensure we have a standard number array
    let samplesArray: number[] = [];
    if (typeof channelSamples === "object" && "length" in channelSamples) {
      samplesArray = Array.from(channelSamples as ArrayLike<number>);
    } else {
      samplesArray = [];
    }

    const totalSamples = samplesArray.length;
    const samplesPerPixel = Math.floor(totalSamples / resolution);

    const averaged = _.range(resolution).map((i) => {
      const start = i * samplesPerPixel;
      const end = (i + 1) * samplesPerPixel;
      const chunk = samplesArray.slice(start, end);
      let sum = 0;
      for (let j = 0; j < chunk.length; j++) sum += Math.abs(chunk[j]);
      return chunk.length > 0 ? sum / chunk.length : 0;
    });

    const maxAmp = _.max(averaged) || 1;
    return averaged.map((amp) => ((amp || 0) / maxAmp).toFixed(4));
  }

  private static async makeWaveTrace(samples: number[]): Promise<string> {
    const maxVal = Math.max(...samples);
    const normalized = samples.map((s) => s / (maxVal || 1));
    const width = 4800,
      height = 200;
    const step = width / normalized.length;

    let pathD = `M 0 ${height / 2}`;
    for (let i = 0; i < normalized.length; i++) {
      pathD += ` L ${(i * step).toFixed(2)} ${(height / 2 - normalized[i] * (height / 2)).toFixed(2)}`;
    }
    for (let i = normalized.length - 1; i >= 0; i--) {
      pathD += ` L ${(i * step).toFixed(2)} ${(height / 2 + normalized[i] * (height / 2)).toFixed(2)}`;
    }
    pathD += " Z";

    const slug = Math.random().toString(36).slice(2);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" version="1.1">
                <mask id="masker-${slug}"><rect x="0" y="0" width="${width}" height="${height}" fill="white"/><path d="${pathD}" fill="black"/></mask>
                <rect class="silence" mask="url(#masker-${slug})" x="0" y="${height / 2 - 1}" width="${width}" height="2" fill="currentColor"/>
                <path class="blobs" d="${pathD}" fill="currentColor"/>
              </svg>`;
  }

  private static bufferToStream(buffer: Buffer): any {
    const { Readable } = require("stream");
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
