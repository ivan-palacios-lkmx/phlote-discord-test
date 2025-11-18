import {
  ApplicationTracksResponse,
  AuthResponse,
  DiscordInteractionRequest,
  DiscordInteractionResponse,
  VersionStemsResponse,
} from "@/types/api";
import { SettingsDoc } from "@/types/database";
import { AddressDoc, AddressDocWithID, SessionDoc, SessionVersionDoc } from "@/types/database";

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
      const response = await apiClient.get(ENDPOINTS.GET_SESSIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }

  static async getSession(sessionID: string): Promise<SessionDoc> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_SESSION + "/" + sessionID);
      return response.data;
    } catch (error) {
      console.error("Error fetching session:", error);
      throw error;
    }
  }

  static async getSessionVersions(): Promise<SessionVersionDoc[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_SESSION_VERSIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching session versions:", error);
      throw error;
    }
  }

  static async getSessionVersion(versionID: string): Promise<SessionVersionDoc> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_SESSION_VERSION + "/" + versionID);
      return response.data;
    } catch (error) {
      console.error("Error fetching session version:", error);
      throw error;
    }
  }

  static async getAddressesInfo(): Promise<AddressDoc[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_ADDRESSES_INFO);
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  }

  static async getAddressInfo(address: string): Promise<AddressDocWithID> {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_ADDRESS_INFO + "/" + address);
      return response.data;
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  }
}

export default Api;
