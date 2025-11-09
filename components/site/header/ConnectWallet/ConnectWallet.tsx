"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./ConnectWallet.scss";
import Web3Avatar from "@/components/slices/landing/StemsPlayer/Web3Avatar/Web3Avatar";
import Web3Username from "../Web3Username/Web3Username";

// TODO: Create SVG Profile icon component
function SvgProfile() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export default function ConnectWallet() {
  const { login } = useLogin();
  const { user, authenticated } = usePrivy();

  const connectedAddress = useMemo(() => {
    if (!user || !authenticated) return null;
    const walletAccount = user.linkedAccounts?.find((acc: any) => acc.type === "wallet");
    return walletAccount && "address" in walletAccount ? (walletAccount.address as string) : null;
  }, [user, authenticated]);

  const openModal = () => {
    login();
  };

  return (
    <button onClick={openModal} className="connect-wallet mono" key={connectedAddress || "not-connected"}>
      <div className="border" />
      <div className="img-wrap">
        {connectedAddress ? (
          <Web3Avatar address={connectedAddress} />
        ) : (
          <SvgProfile />
        )}
      </div>
      {connectedAddress ? (
        <Web3Username address={connectedAddress} />
      ) : (
        <span>Connect</span>
      )}
    </button>
  );
}
