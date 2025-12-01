import {
  AudioAction,
  AudioProcessingStatusResponse,
  AuthResponse,
  SettingsPatch,
  SubmitAudioResponse,
  VersionAudioResponse,
} from "@/types/api";
import { ContactDocWithID, SettingsDoc, Stem, TagCategory } from "@/types/database";
import {
  ActivityDocWithID,
  AddressDoc,
  AddressDocWithID,
  ApplicationDocWithID,
  SessionDoc,
  SessionDocWithID,
  VersionDoc,
  VersionDocWithID,
} from "@/types/database";
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

  static async patchSettings(patch: SettingsPatch): Promise<SettingsDoc> {
    try {
      const response = await apiClient.patch(ENDPOINTS.GET_SETTINGS, patch);
      return response.data;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  static async putSettings(data: { stemsCarousel: string[] }): Promise<{ message: string }> {
    try {
      const response = await apiClient.put(ENDPOINTS.GET_SETTINGS, data);
      return response.data;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  static async getSessions(): Promise<SessionDocWithID[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.SESSIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }

  static async getApplications(): Promise<ApplicationDocWithID[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.APPLICATIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }

  static async getApplicationTracks(
    applicationId: string,
  ): Promise<{ tracksSignedUrls: string[] }> {
    try {
      const response = await apiClient.get(ENDPOINTS.APPLICATION_TRACKS, {
        params: { applicationId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching application tracks:", error);
      throw error;
    }
  }

  static async createSession(sessionDetails: {
    creator: string;
    name: string;
    bounce: string;
    stems: Array<Stem>;
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

  static async getSession(sessionID: string): Promise<SessionDocWithID> {
    try {
      const response = await apiClient.get(ENDPOINTS.SESSIONS + "/" + sessionID);
      return response.data;
    } catch (error) {
      console.error("Error fetching session:", error);
      throw error;
    }
  }

  static async getSessionActivity(sessionID: string): Promise<ActivityDocWithID[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.SESSIONS + "/" + sessionID + "/activity");
      return response.data;
    } catch (error) {
      console.error("Error fetching session activity:", error);
      throw error;
    }
  }

  static async getSessionVersions(sessionID: string, index?: number): Promise<VersionDocWithID[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.SESSIONS + "/" + sessionID + "/versions", {
        params: {
          index: index || undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching session versions:", error);
      throw error;
    }
  }

  static async getVersion(versionID: string): Promise<VersionDocWithID | null> {
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

  static async getAddresses(
    visibility?: "public" | "private",
    role?: "admin" | "creator" | "member",
  ): Promise<{ addresses: AddressDocWithID[]; totalCount: number }> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADDRESS, {
        params: {
          visibility: visibility || undefined,
          role: role || undefined,
        },
      });
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
        ENDPOINTS.ADDRESS + "/" + address + ENDPOINTS.PRIVATE_ADDRESS_INFO,
        contact,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating private address data:", error);
      throw error;
    }
  }

  static async patchAddress(data: {
    address: string;
    role?: string;
    title?: string;
    tags?: string[];
    visibility?: "public" | "private";
  }): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch(ENDPOINTS.ADDRESS, data);
      return response.data;
    } catch (error) {
      console.error("Error patching address:", error);
      throw error;
    }
  }

  static async getVersionAudio(
    versionID: string,
    action: AudioAction,
  ): Promise<VersionAudioResponse> {
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
      const response = await apiClient.get(ENDPOINTS.AUDIO + "/status/" + temporaryAudioFileName);
      return response.data;
    } catch (error) {
      console.error("Error fetching audio processing status:", error);
      throw error;
    }
  }

  static async submitAudio(
    audioFile: File,
    onUploadProgress?: (progress: number) => void,
  ): Promise<SubmitAudioResponse> {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      const response = await apiClient.post(ENDPOINTS.AUDIO, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting audio:", error);
      throw error;
    }
  }

  static async getAudioWaveTrace(audioId: string): Promise<string | undefined> {
    try {
      const response = await apiClient.get(ENDPOINTS.AUDIO + "/wavetrace/" + audioId);
      return response.data.audio;
    } catch (error) {
      console.error("Error fetching audio wave trace:", error);
      throw error;
    }
  }

  static async getTags(category: "member" | "session"): Promise<TagCategory[]> {
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

  static async createAdmin(address: string): Promise<{ message?: string; admin?: WriteResult }> {
    try {
      const response = await apiClient.post(ENDPOINTS.ADMINS, { address });
      return response.data;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  }

  static async deleteAdmin(address: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(ENDPOINTS.ADMINS, {
        data: { address },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting admin:", error);
      throw error;
    }
  }

  static async createCreator(
    address: string,
  ): Promise<{ message?: string; creator?: WriteResult }> {
    try {
      const response = await apiClient.post(ENDPOINTS.CREATORS, { address });
      return response.data;
    } catch (error) {
      console.error("Error creating creator:", error);
      throw error;
    }
  }

  static async deleteCreator(address: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(ENDPOINTS.CREATORS, {
        data: { address },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting creator:", error);
      throw error;
    }
  }

  static async getAdmins(visibility?: "public" | "private"): Promise<AddressDocWithID[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMINS, {
        params: {
          visibility: visibility || undefined,
        },
      });
      return response.data.admins;
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  }

  static async getCreators(visibility?: "public" | "private"): Promise<AddressDocWithID[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.CREATORS, {
        params: {
          visibility: visibility || undefined,
        },
      });
      return response.data.creators;
    } catch (error) {
      console.error("Error fetching creators:", error);
      throw error;
    }
  }

  static async getCategories(): Promise<TagCategory[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.TAG_CATEGORIES);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  static async createTagCategory(
    category: TagCategory,
    categoryType: "member" | "session",
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(ENDPOINTS.TAG_CATEGORIES, {
        category,
        categoryType,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating tag category:", error);
      throw error;
    }
  }

  static async deleteTagCategory(
    category: TagCategory,
    categoryType: "member" | "session",
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(ENDPOINTS.TAG_CATEGORIES, {
        data: { category, categoryType },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting tag category:", error);
      throw error;
    }
  }

  static async subscribeNewsletter(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(ENDPOINTS.NEWSLETTER, { email });
      return response.data;
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      throw error;
    }
  }

  static async createCreatorApplication(data: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    info?: string;
    workLink?: string;
    ethAddress: string;
    tracks: Array<{ name: string; id: string }>;
  }): Promise<{ applicationId: string }> {
    try {
      const response = await apiClient.post(ENDPOINTS.CREATOR_APPLICATIONS, data);
      return response.data;
    } catch (error) {
      console.error("Error creating creator application:", error);
      throw error;
    }
  }

  static async getStemsCarousel(): Promise<string[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.STEMS_CAROUSEL);
      return response.data;
    } catch (error) {
      console.error("Error fetching stems carousel:", error);
      throw error;
    }
  }

  static async updateStemsCarousel(stemsCarousel: string[]): Promise<{ message: string }> {
    try {
      const response = await apiClient.put(ENDPOINTS.STEMS_CAROUSEL, { stemsCarousel });
      return response.data;
    } catch (error) {
      console.error("Error updating stems carousel:", error);
      throw error;
    }
  }

  static async syncAddress(address: string): Promise<{
    address: string;
    isMember: boolean;
    syncStatus: "updated" | "unchanged";
  }> {
    try {
      const response = await apiClient.post(ENDPOINTS.ADDRESS + "/" + address + "/sync");
      return response.data;
    } catch (error) {
      console.error("Error syncing address:", error);
      throw error;
    }
  }
}

export default Api;
