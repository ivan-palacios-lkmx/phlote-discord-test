"use client";

import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useLogin, usePrivy } from "@privy-io/react-auth";

import "./OnlyAdmins.scss";

interface OnlyAdminsProps {
  children: React.ReactNode;
  className?: string;
}

export default function OnlyAdmins({ children, className }: OnlyAdminsProps) {
  const { authenticated } = usePrivy();
  const { user } = usePrivy();
  const { data: addressDoc, isPending } = useGetAddressInfo(
    user?.wallet?.address || "",
    !!user?.wallet?.address && authenticated,
    !!user?.wallet?.address && authenticated,
  );

  const { login } = useLogin();

  return (
    <main className={`only-admins ${className || ""}`}>
      {isPending ? (
        <div className="only-admins-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : addressDoc?.isAdmin ? (
        <div className="only-admins-revealed">{children}</div>
      ) : (
        <div className="only-admins-locked">
          <div className="contained">
            <div className="centered">
              <h4>This area is for admins only</h4>
              <button onClick={() => login()} className="btn">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
