"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

import "./OnlyMembers.scss";

interface OnlyMembersProps {
  children: React.ReactNode;
}

export default function OnlyMembers({ children }: OnlyMembersProps) {
  const { login } = useLogin();
  const { addressDoc, isPending, isError } = useSyncUser();
  const { authenticated, logout, ready } = usePrivy();

  const isMember =
    authenticated && (addressDoc?.isAdmin || addressDoc?.isCreator || addressDoc?.isMember);

  const onConnect = () => {
    if (authenticated) {
      logout();
    }
    login();
  };

  return (
    <main className="only-members">
      {(isPending && authenticated) || !ready ? (
        <div className="only-members-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : isMember ? (
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
      {isError && (
        <div className="only-members-error">
          <div className="contained">
            <div className="centered">
              <h4>Error loading user data.</h4>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
