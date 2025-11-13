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
export function useWeb3Identity() {
  const { user, authenticated } = usePrivy();
  const { addressDoc: syncedAddressDoc } = useSyncUser();
  const [addressDocument, setAddressDocument] = useState<AddressDoc | null>(null);

  // Check if this is the authenticated user's wallet

  useEffect(() => {
    // If this is the authenticated user's wallet, use synced data
    if (authenticated && syncedAddressDoc) {
      setAddressDocument(syncedAddressDoc);
      return;
    }

    // Otherwise, read from Firestore
  }, [authenticated, syncedAddressDoc]);

  const shortAddress = useMemo(() => {
    if (!user?.wallet?.address) return "";
    return (
      user.wallet.address.substring(0, 6) +
      "..." +
      user.wallet.address.substring(user.wallet.address.length - 4)
    );
  }, [user?.wallet?.address]);

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
    shortAddress,
    addressDoc: addressDocument,
    username,
    avatar,
  };
}
