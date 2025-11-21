import firebase from "@/lib/firebase-admin";
import { AudioAction } from "@/types/api";
import { SessionVersionDoc } from "@/types/database";
import { SIGNED_URL_EXPIRATION_TIME_IN_MS } from "@/utils/constants";
import { getCurrentTimestampInMilliseconds } from "@/utils/functions";
import { FileMetadata, File as GCSFile } from "@google-cloud/storage";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import Hash from "ipfs-only-hash";
import kebabCase from "lodash/kebabCase";
import _max from "lodash/max";
import _mean from "lodash/mean";
import _range from "lodash/range";
import _startCase from "lodash/startCase";
import potrace from "potrace";
import sharp from "sharp";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";
import { WaveFile } from "wavefile";
import wf from "wavefile";

export class AudioService {
  static getStemsHashesFromVersion(version: SessionVersionDoc): string[] {
    return version.stems.map((stem: { id: string }) => stem.id);
  }

  static getBucket() {
    return firebase.storage().bucket();
  }

  static async getStemsSignedUrls(stemsHashes: string[], action: AudioAction): Promise<string[]> {
    if (action === "play") {
      return Promise.all(stemsHashes.map((hash) => this.getAudioSignedUrlByHash(hash, "low")));
    }
    if (action === "download") {
      return Promise.all(stemsHashes.map((hash) => this.getAudioSignedUrlByHash(hash, "loseless")));
    }
    return [];
  }

  static async getAudioSignedUrlByHash(
    hash: string,
    quality: "loseless" | "high" | "low",
  ): Promise<string> {
    const filename = this.getFilenameByQuality(quality);
    const bucket = this.getBucket();
    const [signedUrl] = await bucket.file(`audio/${hash}/${filename}`).getSignedUrl({
      action: "read",
      expires: Date.now() + SIGNED_URL_EXPIRATION_TIME_IN_MS,
    });
    return signedUrl;
  }

  static getFilenameByQuality(quality: "loseless" | "high" | "low"): string {
    return quality === "loseless"
      ? "audio.wav"
      : quality === "high"
        ? "audio.mp3"
        : "audio-low.mp3";
  }

  static isAudioWavOrMp3(mimeType: string): "wav" | "mp3" {
    const lowerMimeType = mimeType.toLowerCase();
    if (lowerMimeType === "audio/wav") {
      return "wav";
    }
    if (lowerMimeType === "audio/mp3") {
      return "mp3";
    }
    throw new Error("Audio file must be WAV or MP3 format");
  }

  static async getBounceSignedUrl(bounceHash: string, action: AudioAction): Promise<string> {
    if (action === "play") {
      return this.getAudioSignedUrlByHash(bounceHash, "high");
    }
    if (action === "download") {
      return this.getAudioSignedUrlByHash(bounceHash, "loseless");
    }
    return "";
  }

  static async uploadAudioToStorageAndStartProcessing(
    audioFile: File,
  ): Promise<{ tmpName: string; status: "processing" | "error" }> {
    try {
      const { audioFilename, audioPath, audioBuffer } = await this.prepareAudioForUpload(audioFile);

      const temporaryAudioFile = await this.uploadAudioToStorage(audioPath, audioBuffer);
      // We only start the audio process and we do not await it because we want to return the status immediately
      this.startAudioProcessing(temporaryAudioFile, audioBuffer);

      return { tmpName: audioFilename, status: "processing" };
    } catch (error) {
      console.error("Error processing version audio:", error);
      return { tmpName: "", status: "error" };
    }
  }

  private static async prepareAudioForUpload(
    audioFile: File,
  ): Promise<{ audioFilename: string; audioPath: string; audioBuffer: Buffer }> {
    const audioFilename = this.getAudioStorageFileName(audioFile);
    const audioPath = this.buildAudioPath(audioFilename);
    const audioBuffer = await this.convertAudioToBuffer(audioFile);
    return { audioFilename, audioPath, audioBuffer };
  }

  private static startAudioProcessing(temporaryAudioFile: GCSFile, audioBuffer: Buffer): void {
    // This is not awaited because we want to return the status immediately and process takes time
    this.processAudio(temporaryAudioFile, audioBuffer);
  }

  static async uploadAudioToStorage(audioPath: string, audioBuffer: Buffer): Promise<GCSFile> {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(audioPath);
      await file.save(audioBuffer);
      return file;
    } catch (error) {
      console.error("Error uploading audio to storage:", error);
      throw error;
    }
  }

  static getAudioStorageFileName(audioFile: File): string {
    const seed = this.generateRandomSeed();
    const milliseconds = getCurrentTimestampInMilliseconds();
    const safeFileName = this.getSafeFileName(audioFile.name);
    return `${seed}-${safeFileName}-${milliseconds}`;
  }

  private static generateRandomSeed(): string {
    return Math.random().toString(36).slice(2);
  }

  private static getSafeFileName(fileName: string): string {
    const nameWithoutExtension = String(fileName).split(".")[0];
    const startCasedName = _startCase(nameWithoutExtension);
    return kebabCase(startCasedName);
  }

  private static buildAudioPath(audioFileName: string): string {
    return `tmp/${audioFileName}`;
  }

  static async convertAudioToBuffer(audioFile: File): Promise<Buffer> {
    const audioBuffer = await audioFile.arrayBuffer();
    return Buffer.from(audioBuffer);
  }

  static async processAudio(temporaryAudioFile: GCSFile, audioBuffer: Buffer): Promise<void> {
    try {
      const trackDirectory = await this.prepareDirectoryForAudioProcessing(temporaryAudioFile.name);

      const { normalizedAudioBuffer, normalizedAudioPath } = await this.normalizeAudioToWAV(
        trackDirectory,
        audioBuffer,
      );

      const waveFile = new wf.WaveFile(normalizedAudioBuffer);

      const isAudioSilent = await this.isWaveFileSilent(waveFile);

      if (isAudioSilent) {
        throw new Error("Audio file is silent");
        return;
      }

      const calculatedAudioIPFSHash =
        await this.calculateIPFSHashFromWAVAudio(normalizedAudioBuffer);

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

      const audioProcessingResults = {
        loselessAudioPath: normalizedAudioPath,
        calculatedAudioIPFSHash,
        generatedMP3HighQualityAudioPath,
        generatedMP3LowQualityAudioPath,
        generatedWaveformJSONPath,
        generatedWaveformSVGPath,
      };

      await this.saveAudioToDatabaseAndBucket(audioProcessingResults);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  }
  static async saveAudioToDatabaseAndBucket(audioProcessingResults: {
    loselessAudioPath: string;
    calculatedAudioIPFSHash: string;
    generatedMP3HighQualityAudioPath: string;
    generatedMP3LowQualityAudioPath: string;
    generatedWaveformJSONPath: string;
    generatedWaveformSVGPath: string;
  }) {
    try {
      const bucket = this.getBucket();
      await bucket.upload(audioProcessingResults.generatedMP3HighQualityAudioPath, {
        destination: `audio/${audioProcessingResults.calculatedAudioIPFSHash}/audio.mp3`,
      });
      await bucket.upload(audioProcessingResults.generatedMP3LowQualityAudioPath, {
        destination: `audio/${audioProcessingResults.calculatedAudioIPFSHash}/audio-low.mp3`,
      });
      await bucket.upload(audioProcessingResults.generatedWaveformSVGPath, {
        destination: `audio/${audioProcessingResults.calculatedAudioIPFSHash}/waveform.svg`,
      });
      await bucket.upload(audioProcessingResults.generatedWaveformJSONPath, {
        destination: `audio/${audioProcessingResults.calculatedAudioIPFSHash}/waveform.json`,
      });
      await bucket.upload(audioProcessingResults.loselessAudioPath, {
        destination: `audio/${audioProcessingResults.calculatedAudioIPFSHash}/audio.wav`,
      });
    } catch (error) {
      console.error("Error saving audio to database and bucket:", error);
    }
  }

  static async isWaveFileSilent(waveFile: WaveFile): Promise<boolean> {
    const samples = waveFile.getSamples();
    const samplesArray = Array.isArray(samples[0]) ? (samples[0] as number[]) : [];
    const silentThreshold = 0.01;
    return samplesArray.every((sample) => sample < silentThreshold);
  }

  static async calculateIPFSHashFromWAVAudio(normalizedAudioBuffer: Buffer): Promise<string> {
    return await Hash.of(normalizedAudioBuffer);
  }

  static async generateMP3HighQualityAudio(
    normalizedAudioBuffer: Buffer,
    trackDirectory: string,
  ): Promise<string> {
    const mp3HighQualityLocalPath = `${trackDirectory}/audio.mp3`;
    const stream = await this.bufferToStream(normalizedAudioBuffer);
    await new Promise<void>((res, rej) => {
      return ffmpeg(stream)
        .inputOptions([])
        .outputOptions(["-vn", "-ar 44100", "-ac 2", "-b:a 192k"])
        .output(mp3HighQualityLocalPath)
        .on("error", rej)
        .on("end", res)
        .run();
    });
    return mp3HighQualityLocalPath;
  }

  static async bufferToStream(buffer: Buffer): Promise<Readable> {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  static async generateMP3LowQualityAudio(
    normalizedAudioBuffer: Buffer,
    trackDirectory: string,
  ): Promise<string> {
    const mp3LowLocalPath = `${trackDirectory}/audio-low.mp3`;
    const stream = await this.bufferToStream(normalizedAudioBuffer);
    await new Promise<void>((res, rej) => {
      return ffmpeg(stream)
        .inputOptions([])
        .outputOptions(["-vn", "-codec:a libmp3lame", "-q:a 7"])
        .output(mp3LowLocalPath)
        .on("error", rej)
        .on("end", res)
        .run();
    });
    return mp3LowLocalPath;
  }

  static async generateWaveformJSON(waveFile: WaveFile, trackDirectory: string): Promise<string> {
    const waveformData = this.makeWaveData(waveFile);
    const waveformJSONPath = `${trackDirectory}/waveform.json`;
    await fs.promises.writeFile(waveformJSONPath, JSON.stringify(waveformData));
    return waveformJSONPath;
  }

  static async generateWaveformSVG(waveFile: WaveFile, trackDirectory: string): Promise<string> {
    const waveformData = this.makeWaveData(waveFile);
    const samples = waveformData.map((v) => parseFloat(v));
    const waveformSVG = await this.makeWaveTrace(samples);
    const waveformSVGPath = `${trackDirectory}/waveform.svg`;
    await fs.promises.writeFile(waveformSVGPath, waveformSVG);
    return waveformSVGPath;
  }

  private static samplesToSVG(samples: number[]): string {
    const resolution = samples.length;
    return `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 ${resolution * 4} 100"
        width="${resolution * 4}"
        height="200"
    >
        <g>
            ${samples
              .map((v) => v * 50)
              .map((amp, i) => {
                if (!amp) return "";
                return `<rect
                         x="${i * 4}"
                         y="${50 - amp}"
                         width="5"
                         height="${amp * 2}"
                     />`;
              })
              .join("")}
        </g>
    </svg>
    `;
  }

  private static async makeWaveTrace(samples: number[]): Promise<string> {
    const jobID = uuidv4();
    const jobPath = `/tmp/${jobID}`;
    await fs.promises.rm(jobPath, { recursive: true }).catch(() => {});
    await fs.promises.mkdir(jobPath, { recursive: true });

    await sharp(Buffer.from(this.samplesToSVG(samples))).toFile(`${jobPath}/flattened.png`);

    const finalSVG = await new Promise<string>((res, rej) => {
      potrace.trace(
        `${jobPath}/flattened.png`,
        {
          threshold: 128,
          color: "#000",
        },
        function (err: Error | null, svg: string) {
          if (err) {
            rej(new Error(String(err)));
            return;
          }
          const reg = /path d="([^"]+)/i;
          const matches = svg.match(reg);
          if (!matches || !matches[1]) {
            rej(new Error("Could not extract path from SVG"));
            return;
          }
          const pathD = matches[1];
          const slug = Math.random().toString(36).slice(2);
          return res(
            `
                    <svg xmlns="http://www.w3.org/2000/svg" width="4800" height="200" viewBox="0 0 4800 200" preserveAspectRatio="none" version="1.1">
                        <mask id="masker-${slug}">
                            <rect x="0" y="0" width="4800" height="200" fill="white" />
                            <path d="${pathD}" fill="black" />
                        </mask>
                        <rect class="silence" mask="url(#masker-${slug})" x="0" y="99" width="4800" height="2" fill="currentColor" />
                        <path class="blobs" d="${pathD}" fill="currentColor" />
                    </svg>
                `.trim(),
          );
        },
      );
    });

    await fs.promises.rm(jobPath, { recursive: true }).catch(() => {});
    return finalSVG;
  }

  static makeWaveData(wav: WaveFile, waveformResolution: number = 1200): string[] {
    const samplesArray = wav.getSamples();
    const samples = Array.isArray(samplesArray[0]) ? (samplesArray[0] as number[]) : [];
    const stepSize = Math.floor(samples.length / waveformResolution);
    const resampled = _range(waveformResolution).map((i) =>
      _mean(samples.slice(i * stepSize, (i + 1) * stepSize).map(Math.abs)),
    );
    const newMax = _max(resampled);
    const normalized = resampled.map((s) => ((s || 0) / (newMax || 1)).toFixed(4));
    return normalized;
  }

  private static async normalizeAudioToWAV(
    trackDirectory: string,
    audioBuffer: Buffer,
  ): Promise<{ normalizedAudioBuffer: Buffer; normalizedAudioPath: string }> {
    const normalizedLocalPath = `${trackDirectory}/normalized.wav`;
    const stream = await this.bufferToStream(audioBuffer);
    await new Promise<void>((res, rej) => {
      return ffmpeg(stream)
        .inputOptions([])
        .outputOptions(["-bitexact", "-acodec pcm_s16le", "-ar 44100", "-ac 2"])
        .output(normalizedLocalPath)
        .on("error", rej)
        .on("end", res)
        .run();
    });
    const normalizedAudioBuffer = await this.getBufferFromPath(normalizedLocalPath);
    return { normalizedAudioBuffer, normalizedAudioPath: normalizedLocalPath };
  }
  private static async getMetadataFromAudioFile(
    temporaryAudioFile: GCSFile,
  ): Promise<FileMetadata> {
    const [metadata] = await temporaryAudioFile.getMetadata();
    return metadata;
  }
  private static async prepareDirectoryForAudioProcessing(fileName: string): Promise<string> {
    const trackDirectory = `audio/${fileName}`;
    await this.cleanDirectoryIfExists(trackDirectory);
    await this.createDirectory(trackDirectory);
    return trackDirectory;
  }

  private static async cleanDirectoryIfExists(directoryPath: string): Promise<void> {
    await fs.promises.rm(directoryPath, { recursive: true });
  }

  private static async createDirectory(directoryPath: string): Promise<void> {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  }

  private static async getBufferFromPath(filePath: string): Promise<Buffer> {
    return await fs.promises.readFile(filePath);
  }

  private static async downloadAudioToLocal(
    temporaryAudioFile: GCSFile,
    serverAudioPath: string,
  ): Promise<string> {
    const fileNameFromPath = temporaryAudioFile.name.split("/").pop() || "audio";
    const fileExtension = fileNameFromPath.split(".").pop() || "wav";
    const downloadedAudioPath = `${serverAudioPath}/source.${fileExtension}`;
    await temporaryAudioFile.download({ destination: downloadedAudioPath });
    return downloadedAudioPath;
  }
}
