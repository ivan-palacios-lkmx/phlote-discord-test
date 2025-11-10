"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useGetAccount } from "@/hooks/query/query-hooks/useAccount";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./OnlyMembers.scss";

interface OnlyMembersProps {
  children: React.ReactNode;
}

export default function OnlyMembers({ children }: OnlyMembersProps) {
  const { login } = useLogin();
  const { user, authenticated, ready } = usePrivy();

  const walletAddress = useMemo(() => {
    if (!user || !authenticated) return "";
    const walletAccount = user.linkedAccounts?.find((acc) => acc.type === "wallet");
    return walletAccount && "address" in walletAccount ? (walletAccount.address as string) : "";
  }, [user, authenticated]);

  const { data: accountInfo, isLoading: loadingAccount } = useGetAccount({
    address: walletAddress,
    enabled: authenticated && !!walletAddress,
  });

  const loadingUser = !ready || (authenticated && !!walletAddress && loadingAccount);
  const isMember = useMemo(() => {
    if (!authenticated || !accountInfo?.data) return false;
    const role = accountInfo.data.role;
    return role === "admin" || role === "creator" || role === "member";
  }, [authenticated, accountInfo]);

  const onConnect = () => {
    login();
  };

  return (
    <main className="only-members">
      {loadingUser ? (
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
    </main>
  );
}
