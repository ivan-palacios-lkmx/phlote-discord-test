import apiClient from "./axios";
import { ENDPOINTS } from "./endpoints";
import { SyncUserRequest, SyncUserResponse } from "@/types/api";

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
}
export default Api;
