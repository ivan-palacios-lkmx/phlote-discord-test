import {
  ApplicationTracksResponse,
  DiscordInteractionRequest,
  DiscordInteractionResponse,
  ImageColorsResponse,
  SyncUserRequest,
  SyncUserResponse,
  VersionStemsResponse,
} from "@/types/api";

import apiClient from "./axios";
import { ENDPOINTS } from "./endpoints";

class Api {
  static async getAccount(address: string) {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_ACCOUNT, {
        params: {
          address,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching account:", error);
      throw error;
    }
  }
  static async syncUser(userData: SyncUserRequest): Promise<SyncUserResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.SYNC_USER, userData);
      return response.data;
    } catch (error) {
      console.error("Error syncing user:", error);
      throw error;
    }
  }
  static async getVersionStems(
    versionID: string,
    action: string = "play",
  ): Promise<VersionStemsResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_VERSION_STEMS, {
        params: {
          versionID,
          action,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching version stems:", error);
      throw error;
    }
  }
  static async getApplicationTracks(applicationID: string): Promise<ApplicationTracksResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_APPLICATION_TRACKS, {
        params: {
          applicationID,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching application tracks:", error);
      throw error;
    }
  }
  static async handleDiscordInteraction(
    data: DiscordInteractionRequest,
  ): Promise<DiscordInteractionResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.HANDLE_DISCORD_INTERACTION, data);
      return response.data;
    } catch (error) {
      console.error("Error handling discord interaction:", error);
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
}
export default Api;
