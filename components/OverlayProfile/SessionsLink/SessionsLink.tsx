"use client";

import { auth } from "@/lib/firebase";
import { useLogout } from "@privy-io/react-auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./SessionsLink.scss";

interface SessionsLinkProps {
  profileID?: string;
  onClose?: () => void;
}

export default function SessionsLink({ profileID, onClose }: SessionsLinkProps) {
  const { logout } = useLogout();
  const searchParams = useSearchParams();

  // Create sessions link with query params
  const linkToSessions = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    if (profileID) {
      current.set("collaborators", profileID);
    }
    return {
      pathname: "/sessions",
      search: current.toString(),
    };
  }, [profileID, searchParams]);

  const onDisconnect = () => {
    logout(); // Disconnect from Privy
    firebaseSignOut(auth); // Sign out from Firebase
    onClose?.(); // Close overlay
  };

  return (
    <div className="overlay-profile-sessions-link">
      <Link href={linkToSessions} className="sessions-link">
        My Sessions
      </Link>
      <button type="button" onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
  );
}
