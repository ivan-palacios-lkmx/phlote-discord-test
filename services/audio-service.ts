import firebase from "@/lib/firebase-admin";
import { AudioAction } from "@/types/api";
import { SessionVersionDoc } from "@/types/database";
import { SIGNED_URL_EXPIRATION_TIME_IN_MS } from "@/utils/constants";
import { getCurrentTimestampInMilliseconds } from "@/utils/functions";
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

  static async getBounceSignedUrl(bounceHash: string, action: AudioAction): Promise<string> {
    if (action === "play") {
      return this.getAudioSignedUrlByHash(bounceHash, "high");
    }
    if (action === "download") {
      return this.getAudioSignedUrlByHash(bounceHash, "loseless");
    }
    return "";
  }

  static async uploadAudioToStorageAndSetProcessingStatus(
    audioFile: File,
  ): Promise<{ tmpName: string; status: "processing" | "error" }> {
    try {
      const { audioFilename, audioPath, audioBuffer } = await this.prepareAudioForUpload(audioFile);

      await this.uploadAudioToStorage(audioPath, audioBuffer);
      // We only start the audio process and we do not await it because we want to return the status immediately
      this.startAudioProcessing(audioPath);

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

  private static startAudioProcessing(audioPath: string): void {
    // This is not awaited because we want to return the status immediately and process takes time
    this.processAudio(audioPath);
  }

  static async uploadAudioToStorage(audioPath: string, audioBuffer: Buffer): Promise<void> {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(audioPath);
      await file.save(audioBuffer);
    } catch (error) {
      console.error("Error uploading audio to storage:", error);
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

  static async processAudio(audioPath: string): Promise<void> {
    try {
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  }
}
