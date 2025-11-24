import {
  AudioAction,
  AudioProcessingStatusResponse,
  AuthResponse,
  SubmitAudioResponse,
} from "@/types/api";
import { ContactDocWithID, SettingsDoc, TagCategory } from "@/types/database";
import { AddressDoc, AddressDocWithID, SessionDoc, VersionDoc } from "@/types/database";
import { WriteResult } from "firebase-admin/firestore";

import apiClient from "./axios";
import { ENDPOINTS } from "./endpoints";

class Api {
  static async auth(address: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH, { address });
      return response.data;
    } catch (error) {
      console.error("Error authenticating:", error);
      throw error;
    }
  }

  static async getImageColors(imageUrl: string) {
    try {
      const stripped = imageUrl.replace(/\?.+/g, "");
      const response = await fetch(`${stripped}?palette=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch image colors: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching image colors:", error);
      throw error;
    }
  }

  static async getSettings(): Promise<SettingsDoc> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_SETTINGS);
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  }

  static async getSessions(): Promise<SessionDoc[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.SESSIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }

  static async createSession(sessionDetails: {
    creator: string;
    name: string;
    bounce: string;
    stems: string[];
    notes?: string;
    tags?: string[];
    bpm: number;
  }): Promise<{ message: string; sessionId: string; versionId: string }> {
    try {
      const response = await apiClient.post(ENDPOINTS.SESSIONS, sessionDetails);
      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  static async getSession(sessionID: string): Promise<SessionDoc> {
    try {
      const response = await apiClient.get(ENDPOINTS.SESSIONS + "/" + sessionID);
      return response.data;
    } catch (error) {
      console.error("Error fetching session:", error);
      throw error;
    }
  }

  static async getSessionVersions(sessionID: string): Promise<VersionDoc[]> {
    try {
      const response = await apiClient.get(
        ENDPOINTS.SESSIONS + "/" + ENDPOINTS.VERSIONS + "/" + sessionID,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching session versions:", error);
      throw error;
    }
  }

  static async getVersion(versionID: string): Promise<VersionDoc | null> {
    try {
      const response = await apiClient.get(
        ENDPOINTS.SESSIONS + "/" + ENDPOINTS.VERSIONS + "/" + versionID,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching version:", error);
      throw error;
    }
  }

  static async getAddressesInfo(): Promise<AddressDoc[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADDRESS);
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  }

  static async getAddressInfo(
    address: string,
    includePrivate: boolean = false,
  ): Promise<AddressDocWithID> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADDRESS + "/" + address, {
        params: {
          include: includePrivate ? "private" : undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  }

  static async getAddressPrivateInfo(address: string): Promise<ContactDocWithID> {
    try {
      const response = await apiClient.get(
        ENDPOINTS.ADDRESS + "/" + address + ENDPOINTS.PRIVATE_ADDRESS_INFO,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching private address data:", error);
      throw error;
    }
  }

  static async updatePrivateAddressData(
    address: string,
    contact: ContactDocWithID,
  ): Promise<WriteResult> {
    try {
      const response = await apiClient.put(
        ENDPOINTS.ADDRESS + ENDPOINTS.PRIVATE_ADDRESS_INFO + "/" + address,
        contact,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating private address data:", error);
      throw error;
    }
  }

  static async getVersionAudio(versionID: string, action: AudioAction): Promise<string> {
    try {
      const response = await apiClient.get(
        ENDPOINTS.SESSIONS + "/" + ENDPOINTS.VERSIONS + "/" + versionID + "/" + ENDPOINTS.AUDIO,
        {
          params: {
            action,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching session version audio:", error);
      throw error;
    }
  }

  static async getAudioProcessingStatus(
    temporaryAudioFileName: string,
  ): Promise<AudioProcessingStatusResponse> {
    try {
      const response = await apiClient.get(
        ENDPOINTS.AUDIO + "/" + temporaryAudioFileName + ENDPOINTS.PROCESSING_STATUS,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching audio processing status:", error);
      throw error;
    }
  }

  static async submitAudio(audioFile: File): Promise<SubmitAudioResponse> {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      const response = await apiClient.post(ENDPOINTS.AUDIO, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting audio:", error);
      throw error;
    }
  }

  static async getTags(category: "member" | "session"): Promise<TagCategory[] | undefined> {
    try {
      const response = await apiClient.get(ENDPOINTS.TAGS, {
        params: {
          category: category || undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  }
}

export default Api;
