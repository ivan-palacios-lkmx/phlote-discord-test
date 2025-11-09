import { usePrismicio } from "@/components/PrismicioProvider";
import { db } from "@/lib/firebase";
import checkAddress from "@/utils/checkAddress";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

interface AddressDoc {
  ens?: {
    name?: string;
    avatar?: string;
  };
  zora?: {
    zoraUsername?: string;
    profileImageURL?: string;
  };
  openSea?: {
    osUsername?: string;
    profileImageURL?: string;
  };
  created?: Date;
  shouldUpdate?: boolean;
  [key: string]: unknown;
}

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
  const [addressDocument, setAddressDocument] = useState<AddressDoc | null>(null);

  const cleanAddress = useMemo(() => {
    const addy = address || "";
    return checkAddress(addy);
  }, [address]);

  const addressDocumentReference = useMemo(() => {
    return cleanAddress ? doc(db, "addresses", cleanAddress) : null;
  }, [cleanAddress]);

  useEffect(() => {
    if (!addressDocumentReference) {
      setAddressDocument(null);
      return;
    }

    const unsubscribe = onSnapshot(addressDocumentReference, async (snap) => {
      if (!snap.exists()) {
        await setDoc(addressDocumentReference, {
          created: new Date(),
          shouldUpdate: true,
        });
      } else {
        setAddressDocument(snap.data() as AddressDoc);
      }
    });

    return () => unsubscribe();
  }, [addressDocumentReference]);

  const shortAddress = useMemo(() => {
    if (!cleanAddress) return "";
    return cleanAddress.substring(0, 6) + "..." + cleanAddress.substring(cleanAddress.length - 4);
  }, [cleanAddress]);

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
