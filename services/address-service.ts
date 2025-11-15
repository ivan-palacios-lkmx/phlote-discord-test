import { adminDb } from "@/lib/firebase-admin";
import { AddressDoc } from "@/types/client";
import { ADDRESSES_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromDocumentSnapshot,
  getDocumentDataFromQuerySnapshot,
} from "@/utils/firebase-queries";

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

  static async getSingleAddress(address: string): Promise<AddressDoc | null> {
    const addressDoc = await adminDb.collection(ADDRESSES_COLLECTION).doc(address).get();
    return getDocumentDataFromDocumentSnapshot<AddressDoc>(addressDoc);
  }
}
