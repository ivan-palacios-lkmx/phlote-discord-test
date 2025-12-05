"use client";

import { auth } from "@/lib/firebase";
import { useLogout } from "@privy-io/react-auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import "./SessionsLink.scss";

interface SessionsLinkProps {
  profileID?: string;
  onClose?: () => void;
}

function SessionsLinkContent({ profileID, onClose }: SessionsLinkProps) {
  const { logout } = useLogout();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onDisconnect = () => {
    logout();
    firebaseSignOut(auth);
    onClose?.();
  };

  const handleSessionsClick = useCallback(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("profile");
    if (profileID) {
      current.set("collaborators", profileID);
    }
    const newSearch = current.toString();
    const newUrl = `/sessions${newSearch ? `?${newSearch}` : ""}`;
    onClose?.();
    router.push(newUrl);
  }, [profileID, searchParams, router, onClose]);

  return (
    <div className="overlay-profile-sessions-link">
      <button type="button" onClick={handleSessionsClick} className="sessions-link">
        My Sessions
      </button>
      <button type="button" onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
  );
}

export default function SessionsLink({ profileID, onClose }: SessionsLinkProps) {
  return (
    <Suspense fallback={null}>
      <SessionsLinkContent profileID={profileID} onClose={onClose} />
    </Suspense>
  );
}
