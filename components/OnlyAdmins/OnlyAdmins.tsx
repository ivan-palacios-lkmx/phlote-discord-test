"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useLogin, usePrivy } from "@privy-io/react-auth";

import "./OnlyAdmins.scss";

interface OnlyAdminsProps {
  children: React.ReactNode;
  className?: string;
}

export default function OnlyAdmins({ children, className }: OnlyAdminsProps) {
  const { login } = useLogin();
  const { authenticated, logout, ready, user } = usePrivy();

  const {
    data: addressDoc,
    isPending,
    isError,
  } = useGetAddressInfo(user?.wallet?.address || "", !!user?.wallet?.address && authenticated);

  const isAdmin = authenticated && addressDoc?.isAdmin;

  const onConnect = () => {
    if (authenticated) {
      logout();
    }
    login();
  };

  return (
    <main className={`only-admins ${className}`}>
      {(isPending && authenticated) || !ready ? (
        <div className="only-admins-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : isAdmin ? (
        <div className="only-admins-revealed">{children}</div>
      ) : (
        <div className="only-admins-locked">
          <div className="contained">
            <div className="centered">
              <h4>This content is for admins only.</h4>
              <button onClick={onConnect} className="btn">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
      {isError && (
        <div className="only-admins-error">
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
