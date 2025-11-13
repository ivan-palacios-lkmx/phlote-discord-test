"use client";

import ProfileIcon from "@/components/svg/profile.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";
import { User, useLogin, usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./ConnectWallet.scss";

export default function ConnectWallet() {
  const { user, authenticated } = usePrivy();
  const connectedAddress = useMemo(() => {
    if (!user || !authenticated) return null;
    const wallet = findWallet(user);
    return wallet && "address" in wallet ? (wallet.address as string) : null;
  }, [user, authenticated]);

  // Sync user address automatically - this will create or update the document with all data
  useSyncUser({
    address: connectedAddress || "",
    enabled: !!connectedAddress,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function findWallet(user: User) {
    return user.linkedAccounts?.find((acc) => acc.type === "wallet");
  }

  const { login } = useLogin({
    onComplete: async () => {
      // Sync will happen automatically via the useSyncUser hook
    },
  });

  function showProfileOverlay() {
    const current = new URLSearchParams(searchParams.toString());
    current.set("profile", connectedAddress!);
    const newUrl = `${pathname}${current.toString() ? `?${current.toString()}` : ""}`;
    router.push(newUrl);
  }

  function handleClick() {
    if (connectedAddress) {
      showProfileOverlay();
    } else {
      login();
    }
  }

  return (
    <button
      onClick={handleClick}
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
