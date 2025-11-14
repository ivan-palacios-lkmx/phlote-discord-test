import { adminDb } from "@/lib/firebase-admin";
import { AddressDoc } from "@/types/client";
import { QuerySnapshot } from "firebase-admin/firestore";

import { ADDRESSES_COLLECTION } from "./constants";

async function getDocumentDataFromQuerySnapshot<T>(snapshot: QuerySnapshot): Promise<T[]> {
  return snapshot.docs.map((doc) => doc.data() as T);
}

export async function getAddresses(visibility?: "public" | "private"): Promise<AddressDoc[]> {
  const onlyPublic = visibility === "public";
  const onlyPrivate = visibility === "private";
  if (onlyPublic) {
    const snap = await adminDb.collection(ADDRESSES_COLLECTION).where("isPublic", "==", true).get();
    return getDocumentDataFromQuerySnapshot<AddressDoc>(snap);
  }
  if (onlyPrivate) {
    const snap = await adminDb
      .collection(ADDRESSES_COLLECTION)
      .where("isPublic", "==", false)
      .get();
    return getDocumentDataFromQuerySnapshot<AddressDoc>(snap);
  }
  const addressesSnapshot = await adminDb.collection(ADDRESSES_COLLECTION).get();
  return getDocumentDataFromQuerySnapshot<AddressDoc>(addressesSnapshot);
}

export async function getAddressesAndTotalCount(
  visibility?: "public" | "private",
): Promise<{ addresses: AddressDoc[]; totalCount: number }> {
  const addresses = await getAddresses();
  const onlyPublic = visibility === "public";
  const onlyPrivate = visibility === "private";
  const totalCount = addresses.length;

  // in this case we need to filter the addresses manually, not using the query snapshot
  // because we need to get the total count of the addresses
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
