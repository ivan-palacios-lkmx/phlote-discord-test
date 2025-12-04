"use client";

import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import ProfileIcon from "@/components/icons/Profile";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useAuth } from "@/hooks/query/mutations/use-auth";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, memo, useEffect, useRef } from "react";

import "./ConnectWallet.scss";

const NOT_INCLUDE_PRIVATE_INFO = false;

const ConnectWalletContent = memo(function ConnectWalletContent() {
  const { user, ready, authenticated } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const hasAuthenticatedRef = useRef(false);
  const {
    data: addressInfo,
    isPending: isAddressInfoPending,
    isError: isAddressInfoError,
  } = useGetAddressInfo(walletAddress || "", NOT_INCLUDE_PRIVATE_INFO, !!walletAddress);
  const { mutate: auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      hasAuthenticatedRef.current = false;
      return;
    }

    if (!walletAddress) {
      return;
    }

    if (hasAuthenticatedRef.current) {
      return;
    }

    hasAuthenticatedRef.current = true;
    auth(walletAddress);
  }, [ready, authenticated, walletAddress, auth]);

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
        {isAddressInfoPending && walletAddress ? (
          <LoadingSpinnerIcon />
        ) : isAddressInfoError ? (
          <ProfileIcon />
        ) : addressInfo?.avatar ? (
          <Web3Avatar avatar={addressInfo.avatar} />
        ) : (
          <ProfileIcon />
        )}
      </div>
      {isAddressInfoPending && walletAddress ? (
        <span>Loading</span>
      ) : isAddressInfoError ? (
        <span>Error</span>
      ) : addressInfo?.username ? (
        <Web3Username username={addressInfo?.username} />
      ) : (
        <span>Connect</span>
      )}
    </button>
  );
});

export default function ConnectWallet() {
  return (
    <Suspense fallback={null}>
      <ConnectWalletContent />
    </Suspense>
  );
}
