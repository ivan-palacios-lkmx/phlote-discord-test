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
}

export default Api;
