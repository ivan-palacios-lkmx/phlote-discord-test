"use client";

import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./OnlyAdmins.scss";

interface OnlyAdminsProps {
  children: React.ReactNode;
  className?: string;
}

export default function OnlyAdmins({ children, className }: OnlyAdminsProps) {
  const { user, ready, authenticated, logout } = usePrivy();

  const isUserAllowedToViewContent = useMemo(() => {
    return user?.customMetadata?.role === "admin";
  }, [user]);

  const { login } = useLogin();

  function handleConnectWallet() {
    if (!ready) return;
    if (authenticated) {
      logout();
    }
    login();
  }

  return (
    <main className={`only-admins ${className || ""}`}>
      {!ready ? (
        <div className="only-admins-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : isUserAllowedToViewContent ? (
        <div className="only-admins-revealed">{children}</div>
      ) : (
        <div className="only-admins-locked">
          <div className="contained">
            <div className="centered">
              <h4>This area is for admins only</h4>
              <button onClick={handleConnectWallet} className="btn">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
