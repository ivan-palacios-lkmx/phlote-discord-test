"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { SessionDoc, VersionDoc } from "@/types/database";

import "./SessionDetailTitle.scss";

interface SessionDetailTitleProps {
  session: SessionDoc;
  version: VersionDoc;
}

export default function SessionDetailTitle({ session, version }: SessionDetailTitleProps) {
  const { data: creatorInfo } = useGetAddressInfo(version?.creator, !!version?.creator);

  const versionIndex = `V_${String(version?.versionIndex).padStart(3, "0")}`;

  const otherTags =
    version?.tags
      ?.filter((t: string) => !String(t).includes("needs:"))
      .map((t: string) => String(t).split(":")[1]) || [];

  return (
    <div className="session-detail-title">
      {/* Creator with fade transition */}
      {creatorInfo && (
        <div key={creatorInfo.id} className="version-creator fade-enter-active">
          <Web3Avatar
            avatar={creatorInfo.avatar || "/images/phlote-poster.jpg"}
            className="creator-avatar"
          />
          <Web3Username username={creatorInfo.username || ""} />
        </div>
      )}

      {/* Title area */}
      <div className="detail-title-area">
        <h2 className="detail-title">{session?.name || ""}</h2>
        <span key={versionIndex} className="version-index fade-enter-active">
          {versionIndex}
        </span>
      </div>

      {/* Tags with fade transition */}
      <div key={versionIndex} className="tag-area fade-enter-active">
        {otherTags.map((tag, index) => (
          <span key={index} className="single-tag">
            {tag}
          </span>
        ))}
        <span className="single-tag decoy" aria-hidden>
          &nbsp;
        </span>
      </div>
    </div>
  );
}
