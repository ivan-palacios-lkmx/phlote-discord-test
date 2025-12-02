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
  GLOBAL_COLLECTION,
  OPEN_SEA_API_URL,
  PRIVATE_COLLECTION,
  ROLES_DOC_ID,
} from "@/utils/constants";
import {
  getIDAndDocumentDataFromDocumentSnapshot,
  getIDAndDocumentDataFromQuerySnapshot,
} from "@/utils/firebase-queries";
import { InfuraProvider, Provider } from "ethers";
import {
  DocumentSnapshot,
  FieldValue,
  Query,
  Timestamp,
  WriteResult,
} from "firebase-admin/firestore";

import { RoleService } from "./role-service";

export class AddressService {
  static async updateUsersRolesFromLastDay(): Promise<void> {
    const addresses = await this.getAddresses(
      undefined,
      undefined,
      new Date(Date.now() - 24 * 60 * 60 * 1000),
    );
    for (const address of addresses) {
      await this.updateUserRolesFromLastDay(address);
    }
  }

  static async updateUserRolesFromLastDay(address: AddressDocWithID): Promise<void> {
    await this.updateUserMemberRole(address);
  }

  static async updateUserMemberRole(address: AddressDocWithID): Promise<void> {
    const isAddressAMember = await RoleService.isMember(address.id);
    if (isAddressAMember) {
      await this.addRoleToAddress(address.id, "member");
    } else {
      await this.removeRoleFromAddress(address.id, "member");
    }
  }

  static async getAdmins(visibility?: "public" | "private"): Promise<AddressDocWithID[]> {
    const admins = await this.getAddresses(visibility, "admin");
    return admins;
  }

  static async getCreators(visibility?: "public" | "private"): Promise<AddressDocWithID[]> {
    const creators = await this.getAddresses(visibility, "creator");
    return creators;
  }

  static async deleteAdminAddress(address: string): Promise<void> {
    // TODO: Check permissions to delete admin address, idk if this should be done here or in the middleware
    try {
      await this.deleteAddressFromRoles(address, "admins");
      await this.removeRoleFromAddress(address, "admin");
    } catch (error) {
      console.error("Error deleting admin address:", error);
      throw error;
    }
  }

  static async deleteCreatorAddress(address: string): Promise<void> {
    // TODO: Check permissions to delete creator address, idk if this should be done here or in the middleware
    try {
      await this.deleteAddressFromRoles(address, "creators");
      await this.removeRoleFromAddress(address, "creator");
    } catch (error) {
      console.error("Error deleting creator address:", error);
      throw error;
    }
  }

  static async removeRoleFromAddress(
    address: string,
    role: "admin" | "creator" | "member",
  ): Promise<void> {
    const roleFieldMap = {
      admin: "isAdmin",
      creator: "isCreator",
      member: "isMember",
    } as const;

    await adminDb
      .collection(ADDRESSES_COLLECTION)
      .doc(address)
      .update({
        [roleFieldMap[role]]: false,
        updated: new Timestamp(Math.floor(Date.now() / 1000), 0),
      });
  }

  static async deleteMemberAddress(address: string): Promise<void> {
    // TODO: Check permissions to delete member address, idk if this should be done here or in the middleware
    await this.deleteAddress(address);
  }

  private static async deleteAddress(address: string): Promise<void> {
    await adminDb.collection(ADDRESSES_COLLECTION).doc(address).delete();
  }

  private static async addAddressToRoles(
    address: string,
    toRole: "admins" | "creators",
  ): Promise<void> {
    await adminDb
      .collection(GLOBAL_COLLECTION)
      .doc(ROLES_DOC_ID)
      .update({
        [toRole]: FieldValue.arrayUnion(address),
      });
  }

  private static async deleteAddressFromRoles(
    address: string,
    fromRole: "admins" | "creators",
  ): Promise<void> {
    await adminDb
      .collection(GLOBAL_COLLECTION)
      .doc(ROLES_DOC_ID)
      .update({
        [fromRole]: FieldValue.arrayRemove(address),
      });
  }

  static async getAddresses(
    visibility?: "public" | "private",
    role?: "admin" | "creator" | "member",
    updatedSince?: Date,
  ): Promise<AddressDocWithID[]> {
    let query: Query = adminDb.collection(ADDRESSES_COLLECTION);

    if (visibility === "public") {
      query = query.where("isPublic", "==", true);
    } else if (visibility === "private") {
      query = query.where("isPublic", "==", false);
    }

    if (role === "admin") {
      query = query.where("isAdmin", "==", true);
    } else if (role === "creator") {
      query = query.where("isCreator", "==", true);
    } else if (role === "member") {
      query = query.where("isMember", "==", true);
    }

    if (updatedSince) {
      query = query.where("updated", ">=", updatedSince);
    }

    const addressesSnapshot = await query.get();
    return getIDAndDocumentDataFromQuerySnapshot<AddressDocWithID>(addressesSnapshot);
  }

  static async updateAddress(
    address: string,
    { slug, role }: { slug?: string; role?: "admin" | "creator" | "member" },
  ): Promise<WriteResult> {
    let isCreator = false;
    let isAdmin = false;
    let isMember = false;
    if (role === "creator") isCreator = true;
    if (role === "admin") isAdmin = true;
    if (role === "member") isMember = true;
    const addressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).update({
      slug,
      isCreator,
      isAdmin,
      isMember,
    });
    return addressDoc;
  }

  static async addRoleToAddress(
    address: string,
    role: "admin" | "creator" | "member",
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      updated: new Timestamp(Math.floor(Date.now() / 1000), 0),
    };
    if (role === "creator") updateData.isCreator = true;
    if (role === "admin") updateData.isAdmin = true;
    if (role === "member") updateData.isMember = true;

    await adminDb.collection(ADDRESSES_COLLECTION).doc(address).update(updateData);
  }

  static async getAddressesAndTotalCount(
    visibility?: "public" | "private",
    role?: "admin" | "creator" | "member",
  ): Promise<{ addresses: AddressDocWithID[]; totalCount: number }> {
    const addresses = await this.getAddresses(visibility, role);
    return { addresses, totalCount: addresses.length };
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

      if (isAdmin) {
        await this.addAddressToRoles(address, "admins");
      }
      if (isCreator) {
        await this.addAddressToRoles(address, "creators");
      }

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
    name: string | null,
    twitterHandle: string | null,
    email: string | null,
    discordUserID: string | null,
    discordHandle: string | null,
    dmChannel: string | null,
  ): Promise<WriteResult> {
    const updateData = {
      name,
      twitterHandle,
      email,
      discordUserID,
      discordHandle,
      dmChannel,
      updated: FieldValue.serverTimestamp(),
    };
    const result = await adminDb
      .collection(ADDRESSES_COLLECTION)
      .doc(address)
      .collection(PRIVATE_COLLECTION)
      .doc(CONTACT_DOC_ID)
      .set(updateData, { merge: true });
    return result;
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
    if (!addressDoc?.exists) return null;

    const updates: Record<string, boolean> = {};

    if (role === "admin") {
      updates.isAdmin = true;
      await this.addAddressToRoles(address, "admins");
    } else if (role === "creator") {
      updates.isCreator = true;
      await this.addAddressToRoles(address, "creators");
    } else if (role === "member") {
      updates.isMember = true;
    }
    return addressDoc.ref.set(updates, { merge: true });
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
    return addressDoc.ref.update({
      isPublic: visibility === "public",
      updated: new Date(),
    });
  }
}
