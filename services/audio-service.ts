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
  ): Promise<{ success: boolean }> {
    try {
      const audioPath = this.getAudioPath(audioFile);
      const success = await this.uploadAudioToStorage(audioFile);
      return { success: true };
    } catch (error) {
      console.error("Error processing version audio:", error);
      return { success: false };
    }
  }

  static async uploadAudioToStorage(audioFile: File): Promise<{ success: boolean }> {
    try {
      return { success: true };
    } catch (error) {
      console.error("Error uploading audio to storage:", error);
      return { success: false };
    }
  }

  static getAudioPath(audioFile: File): string {
    const seed = this.generateRandomSeed();
    const milliseconds = getCurrentTimestampInMilliseconds();
    const safeFileName = this.getSafeFileName(audioFile.name);
    return this.buildAudioPath(seed, safeFileName, milliseconds);
  }

  private static generateRandomSeed(): string {
    return Math.random().toString(36).slice(2);
  }

  private static getSafeFileName(fileName: string): string {
    const nameWithoutExtension = String(fileName).split(".")[0];
    const startCasedName = _startCase(nameWithoutExtension);
    return kebabCase(startCasedName);
  }

  private static buildAudioPath(seed: string, safeName: string, milliseconds: number): string {
    return `tmp/${seed}-${safeName}-${milliseconds}`;
  }
}
