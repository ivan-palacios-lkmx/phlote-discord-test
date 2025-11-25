"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { useMemo } from "react";

import "./SessionsCardRow.scss";

interface Version {
  id?: string;
  creator?: string;
  versionIndex?: number;
  [key: string]: unknown;
}

interface SessionsCardRowProps {
  version: Version | null | undefined;
}

function AvatarFromAddress({ address, className }: { address: string; className?: string }) {
  const { data: addressInfo } = useGetAddressInfo(address, false, !!address);

  if (!addressInfo?.avatar) {
    return <div className={`avatar ${className || ""}`} />;
  }

  return <Web3Avatar avatar={addressInfo.avatar} className={`avatar ${className || ""}`} />;
}

export default function SessionsCardRow({ version }: SessionsCardRowProps) {
  const formattedVersion = useMemo(() => {
    if (!version?.versionIndex) return "";
    return `V_${String(version.versionIndex).padStart(3, "0")}`;
  }, [version?.versionIndex]);

  const onDelete = async () => {
    if (!version?.id) return;

    await deleteDoc(doc(db, `session-versions/${version.id}`));
  };

  if (!version) {
    return null;
  }

  return (
    <div className="session-card-row">
      <div className="avatar-area">
        {version.creator && <AvatarFromAddress address={version.creator} />}
      </div>
      <div className="version-name">{formattedVersion}</div>
      <div className="action">
        <button onClick={onDelete} className="btn mono delete-version" type="button">
          Delete
        </button>
      </div>
    </div>
  );
}
