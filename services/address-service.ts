import { adminDb } from "@/lib/firebase-admin";
import { AddressDoc, AddressDocWithID, OpenSeaData } from "@/types/database";
import { ADDRESSES_COLLECTION, OPEN_SEA_API_URL } from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
} from "@/utils/firebase-queries";
import { InfuraProvider, Provider } from "ethers";
import { WriteResult } from "firebase-admin/firestore";

export class AddressService {
  static async getAddresses(visibility?: "public" | "private"): Promise<AddressDoc[]> {
    const onlyPublic = visibility === "public";
    const onlyPrivate = visibility === "private";

    if (onlyPublic) {
      const addressesSnapshot = await adminDb
        .collection(ADDRESSES_COLLECTION)
        .where("isPublic", "==", true)
        .get();
      return getDocumentDataFromQuerySnapshot<AddressDoc>(addressesSnapshot);
    }

    if (onlyPrivate) {
      const addressesSnapshot = await adminDb
        .collection(ADDRESSES_COLLECTION)
        .where("isPublic", "==", false)
        .get();
      return getDocumentDataFromQuerySnapshot<AddressDoc>(addressesSnapshot);
    }

    const addressesSnapshot = await adminDb.collection(ADDRESSES_COLLECTION).get();
    return getDocumentDataFromQuerySnapshot<AddressDoc>(addressesSnapshot);
  }

  static async getAddressesAndTotalCount(
    visibility?: "public" | "private",
  ): Promise<{ addresses: AddressDoc[]; totalCount: number }> {
    const addresses = await this.getAddresses(visibility);
    const onlyPublic = visibility === "public";
    const onlyPrivate = visibility === "private";
    const totalCount = addresses.length;

    if (onlyPublic) {
      return {
        addresses: addresses.filter((address) => address.isPublic === true),
        totalCount,
      };
    }

    if (onlyPrivate) {
      return {
        addresses: addresses.filter((address) => address.isPublic === false),
        totalCount,
      };
    }

    return { addresses, totalCount };
  }

  static async getSingleAddress(address: string): Promise<AddressDocWithID | null> {
    const addressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).get();
    return getIDAndDocumentDataFromDocumentSnapshot<AddressDocWithID>(addressDoc);
  }

  static async createAddress(
    address: string,
    isAddressMember: boolean,
    addressAvatar: string | null,
  ): Promise<WriteResult> {
    try {
      const addressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).set({
        address,
        created: new Date(),
        updated: new Date(),
        avatar: addressAvatar,
        isMember: isAddressMember,
        isAdmin: false,
        isCreator: false,
      });
      return addressDoc;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  static async getAvatarFromExternalSources(address: string): Promise<string | null> {
    const ensAvatar = await this.getAvatarFromENS(address);
    const openSeaAvatar = await this.getAvatarFromOpenSea(address);
    // Zora avatar was not supported on the legacy Phlote app, so we don't support it here either.
    return ensAvatar || openSeaAvatar || null;
  }

  private static async getAvatarFromENS(address: string): Promise<string | null> {
    try {
      const infuraProvider = await this.initializeInfuraProvider();
      const ENSName = await this.getENSName(address, infuraProvider);
      if (!ENSName) return null;
      const avatar = await infuraProvider.getAvatar(ENSName);
      return avatar || null;
    } catch (error) {
      console.error("Error getting avatar from ENS:", error);
      throw error;
    }
  }

  private static async getAvatarFromOpenSea(address: string): Promise<string | null> {
    try {
      const openSeaData = await this.fetchOpenSeaAddressData(address);
      if (!openSeaData) return null;
      return openSeaData.profileImageURL || null;
    } catch (error) {
      console.error("Error getting avatar from OpenSea:", error);
      throw error;
    }
  }

  private static async getENSName(address: string, provider: Provider): Promise<string | null> {
    try {
      const name = await provider.lookupAddress(address);
      return name || null;
    } catch (error) {
      console.error("Error getting ENS name:", error);
      throw error;
    }
  }

  private static async initializeInfuraProvider(): Promise<InfuraProvider> {
    try {
      return new InfuraProvider("mainnet", process.env.INFURA_ID);
    } catch (error) {
      console.error("Error initializing Infura provider:", error);
      throw error;
    }
  }

  private static async fetchOpenSeaAddressData(address: string): Promise<OpenSeaData | null> {
    try {
      if (!process.env.OS_API_KEY) return null;
      const response = await fetch(`${OPEN_SEA_API_URL}/account/${address}`, {
        headers: {
          "X-API-KEY": process.env.OS_API_KEY,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching OpenSea address data:", error);
      throw error;
    }
  }
}
