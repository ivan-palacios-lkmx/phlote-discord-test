import { ClientAddressInfo } from "@/types/client";
import type { AddressDoc } from "@/types/database";
import { transformToShortAddress } from "@/utils/functions";

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

  static async getUsername(account: ClientAddressInfo): Promise<string> {
    try {
      return (
        account.ens?.name ||
        account.openSea?.osUsername ||
        account.zora?.zoraUsername ||
        transformToShortAddress(account.id)
      );
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }
}

export default AuthenticationService;
