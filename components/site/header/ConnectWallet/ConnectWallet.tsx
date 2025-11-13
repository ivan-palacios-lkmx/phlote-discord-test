"use client";

import ProfileIcon from "@/components/svg/profile.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import "./ConnectWallet.scss";

export default function ConnectWallet() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  // Sync user address automatically - this will create or update the document with all data
  useSyncUser();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { login } = useLogin();

  function showProfileOverlay() {
    if (!walletAddress) return;
    const current = new URLSearchParams(searchParams.toString());
    current.set("profile", walletAddress);
    const newUrl = `${pathname}${current.toString() ? `?${current.toString()}` : ""}`;
    router.push(newUrl);
  }

  function handleClick() {
    if (walletAddress) {
      showProfileOverlay();
    } else {
      login();
    }
  }

  return (
    <button
      onClick={handleClick}
      className="connect-wallet mono"
      key={walletAddress || "not-connected"}>
      <div className="border" />
      <div className="img-wrap">
        {walletAddress ? <Web3Avatar address={walletAddress} /> : <ProfileIcon />}
      </div>
      {walletAddress ? <Web3Username address={walletAddress} /> : <span>Connect</span>}
    </button>
  );
}
