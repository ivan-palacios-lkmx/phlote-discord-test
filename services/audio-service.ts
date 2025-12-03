import firebase, { adminDb } from "@/lib/firebase-admin";
import { AudioAction, AudioProcessingStatus } from "@/types/api";
import { AudioDoc, Stem, VersionDoc } from "@/types/database";
import { TemporaryAudioDoc } from "@/types/database";
import { SIGNED_URL_EXPIRATION_TIME_IN_MS, TEMPORARY_AUDIO_COLLECTION } from "@/utils/constants";
import { AUDIO_COLLECTION } from "@/utils/constants";
import { getDocumentDataFromCollectionById } from "@/utils/firebase-queries";
import { getCurrentTimestampInMilliseconds } from "@/utils/functions";
import { FileMetadata, File as GCSFile } from "@google-cloud/storage";
import { FieldValue } from "firebase-admin/firestore";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import Hash from "ipfs-only-hash";
import kebabCase from "lodash/kebabCase";
import _max from "lodash/max";
import _range from "lodash/range";
import _startCase from "lodash/startCase";
import { Readable } from "stream";
import { WaveFile } from "wavefile";

export class AudioService {
  static async getAudioWaveTrace(audioId: string): Promise<string | undefined> {
    const audio = await getDocumentDataFromCollectionById<AudioDoc>(AUDIO_COLLECTION, audioId);
    return audio?.waveTrace;
  }

  static getStemsHashesFromVersion(version: VersionDoc): string[] {
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

      await adminDb.collection("audio_uploads").doc(audioFilename).set({
        status: "processing",
        created: FieldValue.serverTimestamp(),
      });

      await adminDb.collection(TEMPORARY_AUDIO_COLLECTION).doc(audioFilename).set({
        status: "processing",
        hash: "",
        created: FieldValue.serverTimestamp(),
      });

      const temporaryAudioFile = await this.uploadAudioToStorage(audioPath, audioBuffer);
      // We only start the audio process and we do not await it because we want to return the status immediately
      this.startAudioProcessing(temporaryAudioFile, audioBuffer, audioFilename);

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

  private static startAudioProcessing(
    temporaryAudioFile: GCSFile,
    audioBuffer: Buffer,
    audioFilename: string,
  ): void {
    // This is not awaited because we want to return the status immediately and process takes time
    this.processAudio(temporaryAudioFile, audioBuffer, audioFilename);
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

  static async processAudio(
    temporaryAudioFile: GCSFile,
    audioBuffer: Buffer,
    audioFilename: string,
  ): Promise<void> {
    // the track directory is defined here because it is used in the finally block, there we do the existence check
    let trackDirectory: string | null = null;
    try {
      trackDirectory = await this.prepareDirectoryForAudioProcessing(temporaryAudioFile.name);

      const { normalizedAudioBuffer, normalizedAudioPath } = await this.normalizeAudioToWAV(
        trackDirectory,
        audioBuffer,
      );

      const waveFile = new WaveFile();
      waveFile.fromBuffer(normalizedAudioBuffer);

      const isAudioSilent = await this.isWaveFileSilent(waveFile);

      if (isAudioSilent) {
        console.log("processAudio: Audio detected as silent");
        throw new Error("Audio file is silent");
        return;
      }

      const calculatedAudioIPFSHash =
        await this.calculateIPFSHashFromWAVAudio(normalizedAudioBuffer);

      const isAudioAlreadyProcessed = await this.isAudioAlreadyProcessed(calculatedAudioIPFSHash);

      if (isAudioAlreadyProcessed) {
        const temporaryAudioDoc = await getDocumentDataFromCollectionById<TemporaryAudioDoc>(
          TEMPORARY_AUDIO_COLLECTION,
          audioFilename,
        );

        if (!temporaryAudioDoc) {
          console.log("audio not found, creating temporary audio doc");
          await this.createTemporaryAudioDoc(audioFilename, "ready", calculatedAudioIPFSHash);
          return;
        }
        console.log("audio already processed, updating status");
        await this.updateAudioProcessingStatus(audioFilename, "ready", calculatedAudioIPFSHash);
        return;
      }

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

      await this.updateAudioProcessingStatus(audioFilename, "ready", calculatedAudioIPFSHash);
    } catch (error) {
      console.error("Error processing audio:", error);
      await this.updateAudioProcessingStatus(audioFilename, "failed", "");
    } finally {
      if (trackDirectory) {
        await this.deleteDirectory(trackDirectory);
      }
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
    const samplesArray = Array.isArray(samples) ? (samples[0] as number[]) : [];
    const silentThreshold = 100;
    const isSilent = samplesArray.every((sample) => Math.abs(sample) < silentThreshold);
    return isSilent;
  }

  static async calculateIPFSHashFromWAVAudio(normalizedAudioBuffer: Buffer): Promise<string> {
    return await Hash.of(normalizedAudioBuffer);
  }

  static async isAudioAlreadyProcessed(audioIPFSHash: string): Promise<boolean> {
    const bucket = this.getBucket();
    const [exists] = await bucket.file(`audio/${audioIPFSHash}/audio.wav`).exists();
    return exists;
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
        .on("end", () => res())
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
        .on("end", () => res())
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

  private static async makeWaveTrace(samples: number[]): Promise<string> {
    const maxVal = Math.max(...samples);
    const normalizedSamples = samples.map((s) => s / (maxVal || 1));

    const width = 4800;
    const height = 200;
    const totalPoints = normalizedSamples.length;
    const step = width / totalPoints;

    let pathD = `M 0 ${height / 2}`;

    for (let i = 0; i < totalPoints; i++) {
      const x = i * step;
      const y = height / 2 - normalizedSamples[i] * (height / 2);
      pathD += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    for (let i = totalPoints - 1; i >= 0; i--) {
      const x = i * step;
      const y = height / 2 + normalizedSamples[i] * (height / 2);
      pathD += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    pathD += " Z";

    const slug = Math.random().toString(36).slice(2);

    return `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" version="1.1">
                <mask id="masker-${slug}">
                    <rect x="0" y="0" width="${width}" height="${height}" fill="white" />
                    <path d="${pathD}" fill="black" />
                </mask>
                <rect class="silence" mask="url(#masker-${slug})" x="0" y="${height / 2 - 1}" width="${width}" height="2" fill="currentColor" />
                <path class="blobs" d="${pathD}" fill="currentColor" />
            </svg>
        `.trim();
  }

  static makeWaveData(wav: WaveFile, waveformResolution: number = 1200): string[] {
    const allChannels = wav.getSamples();
    const channelSamples =
      Array.isArray(allChannels) && Array.isArray(allChannels[0])
        ? (allChannels[0] as number[])
        : [];

    const totalSamples = channelSamples.length;
    const samplesPerPixel = Math.floor(totalSamples / waveformResolution);

    const averagedSamples = _range(waveformResolution).map((i) => {
      const start = i * samplesPerPixel;
      const end = (i + 1) * samplesPerPixel;
      const chunk = channelSamples.slice(start, end);

      let sum = 0;
      for (let j = 0; j < chunk.length; j++) {
        sum += Math.abs(chunk[j]);
      }
      return chunk.length > 0 ? sum / chunk.length : 0;
    });

    const maxAmplitude = _max(averagedSamples);
    const normalizedSamples = averagedSamples.map((amp) =>
      ((amp || 0) / (maxAmplitude || 1)).toFixed(4),
    );
    return normalizedSamples;
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
        .on("end", () => res())
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
    if (fs.existsSync(directoryPath)) {
      await fs.promises.rm(directoryPath, { recursive: true });
    }
  }

  private static async createDirectory(directoryPath: string): Promise<void> {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  }

  private static async getBufferFromPath(filePath: string): Promise<Buffer> {
    return await fs.promises.readFile(filePath);
  }

  private static async deleteDirectory(directoryPath: string): Promise<void> {
    await fs.promises.rm(directoryPath, { recursive: true });
  }

  private static async updateAudioProcessingStatus(
    audioFilename: string,
    status: AudioProcessingStatus,
    hash: string,
  ): Promise<void> {
    if (audioFilename) {
      await adminDb.collection(TEMPORARY_AUDIO_COLLECTION).doc(audioFilename).set(
        {
          status,
          hash,
          updated: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  static async deleteTemporaryAudioReference(audioFilename: string): Promise<void> {
    await adminDb.collection(TEMPORARY_AUDIO_COLLECTION).doc(audioFilename).delete();
  }

  static async getAudioProcessingStatus(audioFilename: string): Promise<AudioProcessingStatus> {
    const temporaryAudioFileData = await getDocumentDataFromCollectionById<TemporaryAudioDoc>(
      TEMPORARY_AUDIO_COLLECTION,
      audioFilename,
    );

    if (!temporaryAudioFileData) {
      throw new Error(`No temporary audio file found for filename: ${audioFilename}`);
    }
    return temporaryAudioFileData.status;
  }

  static async getAudioProcessingStatusWithHash(
    audioFilename: string,
  ): Promise<{ status: AudioProcessingStatus; hash?: string }> {
    const temporaryAudioFileData = await getDocumentDataFromCollectionById<TemporaryAudioDoc>(
      TEMPORARY_AUDIO_COLLECTION,
      audioFilename,
    );

    if (!temporaryAudioFileData) {
      throw new Error(`No temporary audio file found for filename: ${audioFilename}`);
    }
    return {
      status: temporaryAudioFileData.status,
      hash: temporaryAudioFileData.hash || undefined,
    };
  }

  static async getTrackHashFromTemporaryAudioReference(
    filename: string,
  ): Promise<string | undefined> {
    try {
      const temporaryAudioFileData = await getDocumentDataFromCollectionById<TemporaryAudioDoc>(
        TEMPORARY_AUDIO_COLLECTION,
        filename,
      );

      if (!temporaryAudioFileData) {
        throw new Error(`No temporary audio file found for filename: ${filename}`);
      }

      if (temporaryAudioFileData.status === "processing") {
        throw new Error(`Audio file ${filename} is still being processed`);
      }

      if (temporaryAudioFileData.status === "failed") {
        throw new Error(`Audio file ${filename} failed to process`);
      }

      if (temporaryAudioFileData.status === "pending") {
        throw new Error(`Audio file ${filename} is pending`);
      }

      return temporaryAudioFileData.hash;
    } catch (error) {
      console.error(`Error getting directory hash for filename: ${filename}`, error);
      return "";
    }
  }

  static async getTrackHashesFromTemporaryAudioReferences(filenames: string[]): Promise<string[]> {
    const trackHashes = await Promise.all(
      filenames.map((filename) => this.getTrackHashFromTemporaryAudioReference(filename)),
    );
    return trackHashes.filter((hash): hash is string => !!hash);
  }

  static async getStemsFromTemporaryAudioReferences(
    filenames: string[],
    names: string[],
  ): Promise<Stem[]> {
    const stems = await Promise.all(
      filenames.map((filename) => this.getTrackHashFromTemporaryAudioReference(filename)),
    );

    return stems
      .filter((stem): stem is string => !!stem)
      .map((stem, index) => ({
        id: stem,
        name: names[index],
      }));
  }

  static async getBounceFromTemporaryAudioReference(filename: string): Promise<string | undefined> {
    return this.getTrackHashFromTemporaryAudioReference(filename);
  }
  static async createTemporaryAudioDoc(
    audioFilename: string,
    status: AudioProcessingStatus,
    hash: string,
  ): Promise<void> {
    await adminDb.collection(TEMPORARY_AUDIO_COLLECTION).doc(audioFilename).set({
      status,
      hash,
      created: FieldValue.serverTimestamp(),
    });
  }

  static async validateAudioDurations(
    bounceHash: string,
    stemHashes: string[],
  ): Promise<{
    valid: boolean;
    invalidStems?: string[];
    bounceDuration?: number;
    stemDurations?: { hash: string; duration: number }[];
  }> {
    try {
      const bounceDuration = await this.getAudioDurationFromHash(bounceHash);

      if (!bounceDuration) {
        return { valid: false };
      }

      const stemDurations = await Promise.all(
        stemHashes.map(async (hash) => {
          const duration = await this.getAudioDurationFromHash(hash);
          return { hash, duration };
        }),
      );

      if (stemDurations.some((item) => !item.duration)) {
        return { valid: false };
      }

      const tolerance = 0.01;
      const invalidStems: string[] = [];

      stemDurations.forEach(({ hash, duration }) => {
        if (duration && Math.abs(duration - bounceDuration) >= tolerance) {
          invalidStems.push(hash);
        }
      });

      return {
        valid: invalidStems.length === 0,
        invalidStems: invalidStems.length > 0 ? invalidStems : undefined,
        bounceDuration,
        stemDurations: stemDurations.map(({ hash, duration }) => ({
          hash,
          duration: duration || 0,
        })),
      };
    } catch (error) {
      console.error("Error validating audio durations:", error);
      return { valid: false };
    }
  }

  static async getAudioDurationFromHash(hash: string): Promise<number | null> {
    try {
      const bucket = this.getBucket();
      const wavFile = bucket.file(`audio/${hash}/audio.wav`);

      const [exists] = await wavFile.exists();
      if (!exists) {
        return null;
      }

      const [buffer] = await wavFile.download();

      const waveFile = new WaveFile();
      waveFile.fromBuffer(buffer);

      const fmt = waveFile.fmt as { sampleRate: number; numChannels: number };
      const data = waveFile.data as { samples: number[] | number[][] };

      const sampleRate = fmt.sampleRate;
      const samples = Array.isArray(data.samples)
        ? Array.isArray(data.samples[0])
          ? data.samples[0]
          : data.samples
        : [];
      const sampleCount = samples.length / fmt.numChannels;
      const duration = sampleCount / sampleRate;

      return duration;
    } catch (error) {
      console.error(`Error getting audio duration for hash ${hash}:`, error);
      return null;
    }
  }
}
