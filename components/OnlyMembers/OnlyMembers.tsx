"use client";

import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useLogin, usePrivy } from "@privy-io/react-auth";

import "./OnlyMembers.scss";

interface OnlyMembersProps {
  children: React.ReactNode;
  className?: string;
}

export default function OnlyMembers({ children, className }: OnlyMembersProps) {
  const { login } = useLogin();
  const { authenticated, logout, ready, user } = usePrivy();

  const {
    data: addressDoc,
    isPending,
    isError,
  } = useGetAddressInfo(user?.wallet?.address || "", !!user?.wallet?.address && authenticated);

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
