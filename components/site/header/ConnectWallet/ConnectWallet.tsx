"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import ProfileIcon from "@/components/svg/profile.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useAuth } from "@/hooks/query/mutations/use-auth";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import "./ConnectWallet.scss";

export default function ConnectWallet() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const {
    data: addressInfo,
    isPending: isAddressInfoPending,
    isError: isAddressInfoError,
  } = useGetAddressInfo(walletAddress!, !!walletAddress);

  const { mutate: auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { login } = useLogin({
    onComplete: () => {
      auth(walletAddress!);
    },
  });

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
}
