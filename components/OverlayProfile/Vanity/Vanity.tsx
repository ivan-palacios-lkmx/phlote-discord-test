"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useClientDoc } from "@/hooks/useClientDoc";
import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";
import { db } from "@/lib/firebase";
import type { AddressDoc } from "@/types/client";
import { doc } from "firebase/firestore";
import { useMemo } from "react";

import "./Vanity.scss";

interface VanityProps {
  address: string;
  name?: string;
}

export default function Vanity({ address, name }: VanityProps) {
  const profileDocRef = useMemo(
    () => (address ? doc(db, `addresses/${address}`) : null),
    [address],
  );

  const profileDoc = useClientDoc(profileDocRef) as AddressDoc | null;

  const profileTitle = useMemo(() => {
    if (!profileDoc) return null;

    if (profileDoc.isAdmin) {
      return "Admin";
    }
    if (profileDoc.isCreator) {
      return "Creator";
    }
    return "Member";
  }, [profileDoc]);

  const { addressDoc } = useSyncUser();
  const username = addressDoc?.username;

  const profileName = useMemo(() => name || username, [name, username]);

  return (
    <div className="overlay-profile-vanity">
      <Web3Avatar address={address} />
      <h5 className="profile-name">{profileName}</h5>
      {profileTitle && <div className="profile-title">{profileTitle}</div>}
    </div>
  );
}
