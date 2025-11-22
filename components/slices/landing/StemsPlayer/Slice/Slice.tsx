"use client";

import { AddressClientService } from "@/app/client/services/address-client-service";
import VersionPlayer from "@/components/VersionPlayer/VersionPlayer";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetSession } from "@/hooks/query/query-hooks/use-get-session";
import { useGetVersion } from "@/hooks/query/query-hooks/use-get-version";
import { useState } from "react";

import "./Slice.scss";

interface SliceProps {
  versionID: string;
}

export default function Slice({ versionID }: SliceProps) {
  const [isPointerDown, setIsPointerDown] = useState(false);

  const {
    data: version,
    isPending: isVersionPending,
    isError: isVersionError,
  } = useGetVersion(versionID);
  const {
    data: session,
    isPending: isSessionPending,
    isError: isSessionError,
  } = useGetSession(version?.sessionID ?? "", !!version?.sessionID && !isVersionError);
  const {
    data: creatorInfo,
    isPending: isCreatorInfoPending,
    isError: isCreatorInfoError,
  } = useGetAddressInfo(version?.creator ?? "", !!version?.creator && !isVersionError);

  const isPending = isVersionPending || isSessionPending || isCreatorInfoPending;
  const isError = isVersionError || isSessionError || isCreatorInfoError;
  const avatar = AddressClientService.getAddressAvatar(creatorInfo);
  return (
    <div
      className={`slice-stems-player-slide ${isPointerDown ? "is-pointer-down" : ""}`}
      data-lenis-prevent
      onMouseDown={() => setIsPointerDown(true)}
      onMouseUp={() => setIsPointerDown(false)}
      onMouseLeave={() => setIsPointerDown(false)}>
      <div className="padder">
        {version?.creator && <Web3Avatar avatar={avatar} className="background-image" />}
        {isError ? (
          <div className="error">Error loading session</div>
        ) : isPending ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="session-info">
              <Web3Avatar avatar={avatar} className="artwork desktop-only" />
              <SessionDetailTitle session={session} version={version} />
            </div>
            <VersionPlayer versionData={version} />
          </>
        )}
      </div>
    </div>
  );
}
