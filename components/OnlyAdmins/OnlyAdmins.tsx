"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./OnlyAdmins.scss";

interface OnlyAdminsProps {
  children: React.ReactNode;
  className?: string;
}

function useFbAuth() {
  // TODO: Implement useFbAuth hook properly
  // This should return userDoc and loadingUser similar to Vue version
  const { ready, authenticated, user } = usePrivy();

  const { data: userDoc, isPending } = useGetAddressInfo(
    user?.wallet?.address || "",
    !!user?.wallet?.address && authenticated,
  );

  const loadingUser = useMemo(() => {
    return !ready || (authenticated && isPending);
  }, [ready, authenticated, isPending]);

  return { userDoc, loadingUser };
}

function useWeb3Modal() {
  // TODO: Implement useWeb3Modal hook
  // This should return a ref with openModal method
  const { login } = useLogin();

  return useMemo(
    () => ({
      value: {
        openModal: () => {
          login();
        },
      },
    }),
    [login],
  );
}

export default function OnlyAdmins({ children, className }: OnlyAdminsProps) {
  const { userDoc, loadingUser } = useFbAuth();
  const web3modal = useWeb3Modal();

  const isMember = useMemo(() => {
    return !!(userDoc as { isAdmin?: boolean } | null)?.isAdmin;
  }, [userDoc]);

  const onConnect = () => {
    web3modal.value.openModal();
  };

  return (
    <main className={`only-admins ${className || ""}`}>
      {loadingUser ? (
        <div className="only-admins-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : isMember ? (
        <div className="only-admins-revealed">{children}</div>
      ) : (
        <div className="only-admins-locked">
          <div className="contained">
            <div className="centered">
              <h4>This area is for admins only</h4>
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
