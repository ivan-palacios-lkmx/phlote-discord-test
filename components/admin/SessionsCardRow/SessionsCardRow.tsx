"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { VersionDocWithID } from "@/types/database";
import { useMemo } from "react";

import "./SessionsCardRow.scss";

interface SessionsCardRowProps {
  version: VersionDocWithID;
  onDeleteVersion: (versionId: string) => void;
}
export default function SessionsCardRow({ version, onDeleteVersion }: SessionsCardRowProps) {
  const formattedVersion = useMemo(() => {
    if (!version?.versionIndex) return "";
    return `V_${String(version.versionIndex).padStart(3, "0")}`;
  }, [version?.versionIndex]);

  const { data: addressInfo } = useGetAddressInfo(version.creator || "", false, !!version.creator);

  if (!version) {
    return null;
  }

  const creatorAvatar = addressInfo?.avatar;

  return (
    <div className="session-card-row">
      <div className="avatar-area">{creatorAvatar && <Web3Avatar avatar={creatorAvatar} />}</div>
      <div className="version-name">{formattedVersion}</div>
      <div className="action">
        <button
          onClick={() => onDeleteVersion(version.id)}
          className="btn mono delete-version"
          type="button">
          Delete
        </button>
      </div>
    </div>
  );
}
