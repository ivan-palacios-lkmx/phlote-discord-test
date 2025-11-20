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
import _startCase from "lodash/startCase";

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
      this.startAudioProcessing(temporaryAudioFile);

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

  private static startAudioProcessing(temporaryAudioFile: GCSFile): void {
    // This is not awaited because we want to return the status immediately and process takes time
    this.processAudio(temporaryAudioFile);
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

  static async processAudio(temporaryAudioFile: GCSFile): Promise<void> {
    try {
      const serverAudioPath = await this.prepareDirectoryForAudioProcessing(
        temporaryAudioFile.name,
      );
      const temporaryAudioFileMetadata = await this.getMetadataFromAudioFile(temporaryAudioFile);
      const audioFormat = this.isAudioWavOrMp3(temporaryAudioFileMetadata.contentType || "");
      const downloadedAudioPath = await this.downloadAudioToLocal(
        temporaryAudioFile,
        serverAudioPath,
      );
      const normalizedAudioToWAV = await this.normalizeAudioToWAV(
        serverAudioPath,
        downloadedAudioPath,
      );

      const normalizedAudioBuffer = await this.getBufferFromPath(normalizedAudioToWAV);

      const calculatedAudioIPFSHash =
        await this.calculateIPFSHashFromWAVAudio(normalizedAudioBuffer);

      const generatedMP3HighQualityAudio = await this.generateMP3HighQualityAudio(
        normalizedAudioToWAV,
        serverAudioPath,
      );

      const generatedMP3LowQualityAudio = await this.generateMP3LowQualityAudio(
        normalizedAudioToWAV,
        serverAudioPath,
      );

      const generatedWAVLoselessAudio = this.generateWAVLoselessAudio(temporaryAudioFile);
      const generatedWaveformJSON = this.generateWaveformJSON(temporaryAudioFile);
      const generatedWaveformSVG = this.generateWaveformSVG(temporaryAudioFile);

      const audioProcessingResults = {
        temporaryAudioFile,
        temporaryAudioFileMetadata,
        normalizedAudioToWAV,
        calculatedAudioIPFSHash,
        generatedMP3HighQualityAudio,
        generatedMP3LowQualityAudio,
        generatedWAVLoselessAudio,
        generatedWaveformJSON,
        generatedWaveformSVG,
      };

      this.saveAudioToDatabase(audioProcessingResults);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  }
  static saveAudioToDatabase(audioProcessingResults: {
    temporaryAudioFile: GCSFile;
    temporaryAudioFileMetadata: FileMetadata;
    normalizedAudioToWAV: string;
    calculatedAudioIPFSHash: string;
    generatedMP3HighQualityAudio: unknown;
    generatedMP3LowQualityAudio: unknown;
    generatedWAVLoselessAudio: unknown;
    generatedWaveformJSON: unknown;
    generatedWaveformSVG: unknown;
  }) {
    throw new Error("Method not implemented.");
  }
  static async calculateIPFSHashFromWAVAudio(normalizedAudioBuffer: Buffer): Promise<string> {
    return await Hash.of(normalizedAudioBuffer);
  }
  static async generateMP3HighQualityAudio(
    normLocalPath: string,
    serverAudioPath: string,
  ): Promise<string> {
    const mp3LocalPath = `${serverAudioPath}/audio.mp3`;
    await new Promise<void>((res, rej) => {
      return ffmpeg(normLocalPath)
        .inputOptions([])
        .outputOptions(["-vn", "-ar 44100", "-ac 2", "-b:a 192k"])
        .output(mp3LocalPath)
        .on("error", rej)
        .on("end", res)
        .run();
    });
    return mp3LocalPath;
  }
  static async generateMP3LowQualityAudio(
    normLocalPath: string,
    serverAudioPath: string,
  ): Promise<string> {
    const mp3LowLocalPath = `${serverAudioPath}/audio-low.mp3`;
    await new Promise<void>((res, rej) => {
      return ffmpeg(normLocalPath)
        .inputOptions([])
        .outputOptions(["-vn", "-codec:a libmp3lame", "-q:a 7"])
        .output(mp3LowLocalPath)
        .on("error", rej)
        .on("end", res)
        .run();
    });
    return mp3LowLocalPath;
  }
  static generateWAVLoselessAudio(temporaryAudioFile: GCSFile) {
    throw new Error("Method not implemented.");
  }
  static generateWaveformJSON(temporaryAudioFile: GCSFile) {
    throw new Error("Method not implemented.");
  }
  static generateWaveformSVG(temporaryAudioFile: GCSFile) {
    throw new Error("Method not implemented.");
  }
  private static async normalizeAudioToWAV(
    serverAudioPath: string,
    downloadedAudioPath: string,
  ): Promise<string> {
    const normalizedLocalPath = `${serverAudioPath}/normalized.wav`;
    await new Promise<void>((res, rej) => {
      return ffmpeg(downloadedAudioPath)
        .inputOptions([])
        .outputOptions(["-bitexact", "-acodec pcm_s16le", "-ar 44100", "-ac 2"])
        .output(normalizedLocalPath)
        .on("error", rej)
        .on("end", res)
        .run();
    });
    return normalizedLocalPath;
  }
  private static async getMetadataFromAudioFile(
    temporaryAudioFile: GCSFile,
  ): Promise<FileMetadata> {
    const [metadata] = await temporaryAudioFile.getMetadata();
    return metadata;
  }
  private static async prepareDirectoryForAudioProcessing(fileName: string): Promise<string> {
    const serverAudioPath = `/tmp/audio-processing/${fileName}`;
    await this.cleanDirectoryIfExists(serverAudioPath);
    await this.createDirectory(serverAudioPath);
    return serverAudioPath;
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
