"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";

import "./Vanity.scss";

interface VanityProps {
  address: string;
}

export default function Vanity({ address }: VanityProps) {
  const {
    data: addressInfo,
    isPending: isAddressInfoPending,
    isError: isAddressInfoError,
  } = useGetAddressInfo(address, !!address);

  return (
    <div className="overlay-profile-vanity">
      {isAddressInfoPending ? (
        <LoadingSpinnerIcon />
      ) : isAddressInfoError ? (
        <span>Error</span>
      ) : (
        <>
          {addressInfo?.avatar && <Web3Avatar avatar={addressInfo.avatar} />}
          <h5 className="profile-name">{addressInfo?.username}</h5>
          {addressInfo?.title && <div className="profile-title">{addressInfo.title}</div>}
        </>
      )}
    </div>
  );
}
