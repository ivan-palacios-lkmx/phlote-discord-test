import { adminDb } from "@/lib/firebase-admin";
import {
  AddressDoc,
  AddressDocWithID,
  AddressDocWithPrivateData,
  ContactDocWithID,
  OpenSeaData,
} from "@/types/database";
import {
  ADDRESSES_COLLECTION,
  CONTACT_DOC_ID,
  OPEN_SEA_API_URL,
  PRIVATE_COLLECTION,
} from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
} from "@/utils/firebase-queries";
import { InfuraProvider, Provider } from "ethers";
import { DocumentSnapshot, WriteResult } from "firebase-admin/firestore";

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

  static async getSingleAddress(
    address: string,
    includePrivate: boolean,
  ): Promise<AddressDocWithID | AddressDocWithPrivateData | null> {
    if (includePrivate) {
      const publicAddressDoc = await this.getPublicAddressData(address);
      if (!publicAddressDoc) return null;
      const privateAddressDoc = await this.getPrivateAddressData(address);
      const fullAddressDoc: AddressDocWithPrivateData = {
        ...publicAddressDoc,
        private: privateAddressDoc,
      };
      return fullAddressDoc;
    } else {
      const addressDoc = await this.getPublicAddressData(address);
      return addressDoc;
    }
  }

  /**
   * Creates a new address document in the database.
   * @param address The blockchain address string.
   * @param isAddressMember A boolean indicating if the address is a member.
   * @param addressAvatar The URL of the address's avatar, or null if none.
   * @param isCreator A boolean indicating if the address is a creator.
   * @param isAdmin A boolean indicating if the address has admin privileges.
   * @returns A Promise that resolves to a WriteResult upon successful creation.
   * @throws Throws an error if there's an issue creating the address.
   */
  static async createAddress(
    address: string,
    isAddressMember: boolean,
    addressAvatar: string | null,
    isCreator: boolean,
    isAdmin: boolean,
  ): Promise<WriteResult> {
    try {
      const addressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).set({
        address,
        created: new Date(),
        updated: new Date(),
        avatar: addressAvatar,
        isMember: isAddressMember,
        isAdmin,
        isCreator,
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

  static async getPrivateAddressData(address: string): Promise<ContactDocWithID | null> {
    const privateAddressDoc = await adminDb
      .collection(ADDRESSES_COLLECTION)
      .doc(address)
      .collection(PRIVATE_COLLECTION)
      .doc(CONTACT_DOC_ID)
      .get();
    return getIDAndDocumentDataFromDocumentSnapshot<ContactDocWithID>(privateAddressDoc);
  }

  static async getPublicAddressData(address: string): Promise<AddressDocWithID | null> {
    const publicAddressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).get();
    return getIDAndDocumentDataFromDocumentSnapshot<AddressDocWithID>(publicAddressDoc);
  }

  static async updatePrivateAddressData(
    address: string,
    contact: ContactDocWithID,
  ): Promise<WriteResult> {
    const privateAddressDoc = await adminDb
      .collection(ADDRESSES_COLLECTION)
      .doc(address)
      .collection(PRIVATE_COLLECTION)
      .doc(CONTACT_DOC_ID)
      .set(contact);
    return privateAddressDoc;
  }

  static async getRawAddressSnapshot(
    address: string,
  ): Promise<DocumentSnapshot<AddressDoc> | null> {
    const addressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).get();
    if (!addressDoc.exists) return null;
    return addressDoc;
  }

  static async updateAddressRole(
    address: string,
    role: "admin" | "creator" | "member",
  ): Promise<WriteResult | null> {
    const addressDoc = await this.getRawAddressSnapshot(address);
    if (!addressDoc) return null;
    if (role === "admin") {
      addressDoc.data()!.isAdmin = true;
    } else if (role === "creator") {
      addressDoc.data()!.isCreator = true;
    } else if (role === "member") {
      addressDoc.data()!.isMember = true;
    }
    return addressDoc.ref.set(addressDoc.data()!);
  }

  static async updateAddressTitle(address: string, title: string): Promise<WriteResult | null> {
    const addressDoc = await this.getRawAddressSnapshot(address);
    if (!addressDoc) return null;
    addressDoc.data()!.title = title;
    return addressDoc.ref.set(addressDoc.data()!);
  }

  static async updateAddressTags(address: string, tags: string[]): Promise<WriteResult | null> {
    const addressDoc = await this.getRawAddressSnapshot(address);
    if (!addressDoc) return null;
    addressDoc.data()!.tags = tags;
    return addressDoc.ref.set(addressDoc.data()!);
  }

  static async updateAddressVisibility(
    address: string,
    visibility: "public" | "private",
  ): Promise<WriteResult | null> {
    const addressDoc = await this.getRawAddressSnapshot(address);
    if (!addressDoc) return null;
    addressDoc.data()!.isPublic = visibility === "public";
    return addressDoc.ref.set(addressDoc.data()!);
  }
}
