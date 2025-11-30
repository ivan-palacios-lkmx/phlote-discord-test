"use client";

import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./OnlyMembers.scss";

interface OnlyMembersProps {
  children: React.ReactNode;
  className?: string;
}

export default function OnlyMembers({ children, className }: OnlyMembersProps) {
  const { login } = useLogin();
  const { authenticated, logout, ready, user } = usePrivy();

  const isUserAllowedToViewContent = useMemo(() => {
    return (
      user?.customMetadata?.role === "member" ||
      user?.customMetadata?.role === "creator" ||
      user?.customMetadata?.role === "admin"
    );
  }, [user]);

  const onConnect = () => {
    if (authenticated) {
      logout();
    }
    login();
  };

  return (
    <main className={`only-members ${className}`}>
      {!ready ? (
        <div className="only-members-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : isUserAllowedToViewContent ? (
        <div className="only-members-revealed">{children}</div>
      ) : (
        <div className="only-members-locked">
          <div className="contained">
            <div className="centered">
              <h4>This content is for members only.</h4>
              <button onClick={onConnect} className="btn">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
