"use client";

import VersionPlayer from "@/components/VersionPlayer/VersionPlayer";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetSession } from "@/hooks/query/query-hooks/use-get-session";
import { useGetVersionSession } from "@/hooks/query/query-hooks/use-get-version-session";
import { useState } from "react";

import "./Slice.scss";

interface SliceProps {
  versionID: string;
}

export default function Slice({ versionID }: SliceProps) {
  const [isPointerDown, setIsPointerDown] = useState(false);

  const { data: version, isLoading: isVersionLoading } = useGetVersionSession(versionID);
  const { data: session, isLoading: isSessionLoading } = useGetSession(
    version?.sessionID as string,
    !!version?.sessionID,
  );
  const { data: creatorInfo } = useGetAddressInfo(version?.creator as string, !!version?.creator);

  return (
    <div
      className={`slice-stems-player-slide ${isPointerDown ? "is-pointer-down" : ""}`}
      data-lenis-prevent
      onMouseDown={() => setIsPointerDown(true)}
      onMouseUp={() => setIsPointerDown(false)}
      onMouseLeave={() => setIsPointerDown(false)}>
      <div className="padder">
        {version?.creator && (
          <Web3Avatar
            avatar={
              creatorInfo?.ens?.avatar ||
              creatorInfo?.openSea?.profileImageURL ||
              creatorInfo?.zora?.profileImageURL ||
              "/images/phlote-poster.jpg"
            }
            className="background-image"
          />
        )}

        <div className="session-info">
          {version?.creator && (
            <Web3Avatar
              avatar={
                creatorInfo?.ens?.avatar ||
                creatorInfo?.openSea?.profileImageURL ||
                creatorInfo?.zora?.profileImageURL ||
                "/images/phlote-poster.jpg"
              }
              className="artwork desktop-only"
            />
          )}
          {!isSessionLoading && !isVersionLoading && (
            <SessionDetailTitle session={session} version={version} />
          )}
        </div>

        {version && <VersionPlayer versionData={version} />}
      </div>
    </div>
  );
}
