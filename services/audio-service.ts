import firebase, { adminDb } from "@/lib/firebase-admin";
import { AudioAction, AudioProcessingStatus } from "@/types/api";
import { AudioDoc, Stem, VersionDoc } from "@/types/database";
import { TemporaryAudioDoc } from "@/types/database";
import { SIGNED_URL_EXPIRATION_TIME_IN_MS, TEMPORARY_AUDIO_COLLECTION } from "@/utils/constants";
import { AUDIO_COLLECTION } from "@/utils/constants";
import { getDocumentDataFromCollectionById } from "@/utils/firebase-queries";
import { getCurrentTimestampInMilliseconds } from "@/utils/functions";
import { File as GCSFile } from "@google-cloud/storage";
import { FieldValue } from "firebase-admin/firestore";
import kebabCase from "lodash/kebabCase";
import _startCase from "lodash/startCase";
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

      await this.uploadAudioToStorage(audioPath, audioBuffer);

      // Processing is now handled by a Firebase Cloud Function trigger on file upload

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

      const fmt = waveFile.fmt as any;
      const data = waveFile.data as any;

      const sampleRate = fmt.sampleRate;
      const sampleCount = data.samples.length / fmt.numChannels;
      const duration = sampleCount / sampleRate;

      return duration;
    } catch (error) {
      console.error(`Error getting audio duration for hash ${hash}:`, error);
      return null;
    }
  }
}
