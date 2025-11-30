import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { usePrivy } from "@privy-io/react-auth";
import { useLogin } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./OnlyCreators.scss";

interface OnlyCreatorsProps {
  children: React.ReactNode;
  className?: string;
}
export default function OnlyCreators({ children, className }: OnlyCreatorsProps) {
  const { user, ready, authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const isUserAllowedToViewContent = useMemo(() => {
    return user?.customMetadata?.role === "creator" || user?.customMetadata?.role === "admin";
  }, [user]);

  function handleConnectWallet() {
    if (!ready) return;
    if (authenticated) {
      logout();
      return;
    }
    login();
  }

  return (
    <main className={`only-creators ${className}`}>
      {!ready ? (
        <div className="only-creators-loading">
          <LoadingSpinnerIcon />
        </div>
      ) : isUserAllowedToViewContent ? (
        <div className="only-creators-revealed">{children}</div>
      ) : (
        <div className="only-creators-locked">
          <div className="contained">
            <div className="centered">
              <h4>This area is for creators only.</h4>
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
