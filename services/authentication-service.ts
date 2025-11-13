import apiClient from "@/hooks/query/axios";
import { ENDPOINTS } from "@/hooks/query/endpoints";
import { SyncUserRequest, SyncUserResponse } from "@/types/api";

class AuthenticationService {
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

export default AuthenticationService;
