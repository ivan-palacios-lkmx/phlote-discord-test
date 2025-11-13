import { usePrismicio } from "@/components/PrismicioProvider";
import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";
import { db } from "@/lib/firebase";
import type { AddressDoc } from "@/types/client";
import { usePrivy } from "@privy-io/react-auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

/**
 * React hook for getting Web3 identity information (avatar, username, etc.)
 * based on a wallet address.
 *
 * @param address - The wallet address to get identity for (can be string or reactive ref)
 * @returns An object containing identity information like avatar, username, addressDoc, etc.
 *
 * @example
 * ```tsx
 * import { useWeb3Identity } from "@/hooks/useWeb3Identity";
 *
 * function MyComponent() {
 *   const { avatar, username } = useWeb3Identity("0x123...");
 *
 *   return (
 *     <div>
 *       {avatar && <img src={avatar} />}
 *       <p>{username}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWeb3Identity(address: string | null | undefined) {
  const { user } = usePrivy();
  const { addressDoc: syncedAddressDoc } = useSyncUser();
  const [addressDocument, setAddressDocument] = useState<AddressDoc | null>(null);

  const addressDocumentReference = useMemo(() => {
    return address ? doc(db, "addresses", address) : null;
  }, [address]);

  // Check if this is the authenticated user's wallet
  const isAuthenticatedUser = useMemo(() => {
    return address && user?.wallet?.address?.toLowerCase() === address.toLowerCase();
  }, [address, user?.wallet?.address]);

  useEffect(() => {
    // If this is the authenticated user's wallet, use synced data
    if (isAuthenticatedUser && syncedAddressDoc) {
      setAddressDocument(syncedAddressDoc);
      return;
    }

    // Otherwise, read from Firestore
    if (!addressDocumentReference) {
      setAddressDocument(null);
      return;
    }

    const unsubscribe = onSnapshot(addressDocumentReference, (snap) => {
      if (snap.exists()) {
        setAddressDocument(snap.data() as AddressDoc);
      }
    });

    return () => unsubscribe();
  }, [addressDocumentReference, isAuthenticatedUser, syncedAddressDoc]);

  const shortAddress = useMemo(() => {
    if (!address) return "";
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
  }, [address]);

  const username = useMemo(() => {
    const ensUsername = addressDocument?.ens?.name;
    let zoraUsername = addressDocument?.zora?.zoraUsername;
    let openSeaUsername = addressDocument?.openSea?.osUsername;

    zoraUsername = zoraUsername ? `${zoraUsername}` : "";
    openSeaUsername = openSeaUsername ? `${openSeaUsername}` : "";

    const username = ensUsername || openSeaUsername || zoraUsername || shortAddress;
    return username;
  }, [addressDocument, shortAddress]);

  const { settings: prismicioSettings } = usePrismicio();

  const avatar = useMemo(() => {
    return (
      addressDocument?.ens?.avatar ||
      addressDocument?.zora?.profileImageURL ||
      addressDocument?.openSea?.profileImageURL ||
      prismicioSettings?.default_user_image?.url ||
      "/images/phlote-poster.jpg"
    );
  }, [addressDocument, prismicioSettings]);

  return {
    addressDocRef: addressDocumentReference,
    shortAddress,
    addressDoc: addressDocument,
    username,
    avatar,
  };
}
