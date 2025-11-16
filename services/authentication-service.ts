import apiClient from "@/hooks/query/axios";
import { ENDPOINTS } from "@/hooks/query/endpoints";
import { SyncUserRequest, SyncUserResponse } from "@/types/api";
import type { AddressDoc } from "@/types/database";

class AuthenticationService {
  static getShortAddress(address: string): string {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  static getAvatar(addressDoc: AddressDoc | null | undefined): string | false | null {
    if (!addressDoc) return null;
    return (
      addressDoc.ens?.avatar ||
      addressDoc.zora?.profileImageURL ||
      addressDoc.openSea?.profileImageURL ||
      "/images/phlote-poster.jpg"
    );
  }

  static async getUsername(account: AddressDoc, shortAddress: string): Promise<string> {
    try {
      return (
        account.ens?.name ||
        account.openSea?.osUsername ||
        account.zora?.zoraUsername ||
        shortAddress
      );
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async syncUser(userData: SyncUserRequest): Promise<SyncUserResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.SYNC_USER, userData);
      const data = response.data;

      // Add shortAddress and avatar to the response
      const shortAddress = this.getShortAddress(userData.address);
      const avatar = this.getAvatar(data);
      const username = this.getUsername(data, shortAddress);

      return {
        ...data,
        shortAddress,
        avatar,
        username,
      };
    } catch (error) {
      console.error("Error syncing user:", error);
      throw error;
    }
  }
}

export default AuthenticationService;
