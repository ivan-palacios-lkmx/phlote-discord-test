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
  const [addressDoc, setAddressDoc] = useState<AddressDoc | null>(null);

  // Resolve FB identity doc, clean address
  const cleanAddress = useMemo(() => {
    const addy = address || "";
    return checkAddress(addy);
  }, [address]);

  const addressDocRef = useMemo(() => {
    return cleanAddress ? doc(db, "addresses", cleanAddress) : null;
  }, [cleanAddress]);

  // Create if needed, and listen to snapshot
  useEffect(() => {
    if (!addressDocRef) {
      setAddressDoc(null);
      return;
    }

    const unsubscribe = onSnapshot(addressDocRef, async (snap) => {
      if (!snap.exists()) {
        await setDoc(addressDocRef, {
          created: new Date(),
          shouldUpdate: true,
        });
      } else {
        setAddressDoc(snap.data() as AddressDoc);
      }
    });

    return () => unsubscribe();
  }, [addressDocRef]);

  const shortAddress = useMemo(() => {
    if (!cleanAddress) return "";
    return cleanAddress.substring(0, 6) + "..." + cleanAddress.substring(cleanAddress.length - 4);
  }, [cleanAddress]);

  // Resolve username
  const username = useMemo(() => {
    const ens = addressDoc?.ens?.name;
    let zora = addressDoc?.zora?.zoraUsername;
    let os = addressDoc?.openSea?.osUsername;

    zora = zora ? `${zora}` : "";
    os = os ? `${os}` : "";

    const un = ens || os || zora || shortAddress;
    return un;
  }, [addressDoc, shortAddress]);

  const { settings: prisSettings } = usePrismicio();

  // Resolve avatar image URL
  const avatar = useMemo(() => {
    return (
      addressDoc?.ens?.avatar ||
      addressDoc?.zora?.profileImageURL ||
      addressDoc?.openSea?.profileImageURL ||
      prisSettings?.default_user_image?.url ||
      "/images/phlote-poster.jpg"
    );
  }, [addressDoc, prisSettings]);

  return {
    addressDocRef,
    shortAddress,
    addressDoc,
    username,
    avatar,
  };
}
