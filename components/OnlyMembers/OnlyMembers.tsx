"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useGetAccount } from "@/hooks/query/query-hooks/useAccount";
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

  const walletAddress = useMemo(() => {
    if (!user?.linkedAccounts) return null;
    const wallet = user.linkedAccounts.find((acc) => acc.type === "wallet");
    return wallet && "address" in wallet ? (wallet.address as string) : null;
  }, [user]);

  const { data: addressDoc, isPending, isError } = useGetAccount({
    address: walletAddress || "",
    enabled: !!walletAddress && authenticated,
  });

  const isMember =
    authenticated && (addressDoc?.isAdmin || addressDoc?.isCreator || addressDoc?.isMember);

  const onConnect = () => {
    if (authenticated) {
      logout();
    }
    login();
  };

  return (
    <main className={`only-members ${className}`}>
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
