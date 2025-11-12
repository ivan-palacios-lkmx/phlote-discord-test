"use client";

import ProfileIcon from "@/components/svg/profile.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { User, useLogin, usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

import "./ConnectWallet.scss";

export default function ConnectWallet() {
  const { login } = useLogin();
  const { user, authenticated } = usePrivy();

  function findWallet(user: User) {
    return user.linkedAccounts?.find((acc) => acc.type === "wallet");
  }
  const connectedAddress = useMemo(() => {
    if (!user || !authenticated) return null;
    const wallet = findWallet(user);
    return wallet && "address" in wallet ? (wallet.address as string) : null;
  }, [user, authenticated]);

  return (
    <button
      onClick={login}
      className="connect-wallet mono"
      key={connectedAddress || "not-connected"}>
      <div className="border" />
      <div className="img-wrap">
        {connectedAddress ? <Web3Avatar address={connectedAddress} /> : <ProfileIcon />}
      </div>
      {connectedAddress ? <Web3Username address={connectedAddress} /> : <span>Connect</span>}
    </button>
  );
}
