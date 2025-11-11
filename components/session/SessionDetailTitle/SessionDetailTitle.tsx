"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useMemo } from "react";

import "./SessionDetailTitle.scss";

interface SessionDetailTitleProps {
  session?: {
    name?: string;
    [key: string]: unknown;
  } | null;
  version?: {
    creator?: string;
    versionIndex?: number;
    tags?: string[];
    bpm?: number;
    [key: string]: unknown;
  } | null;
}

export default function SessionDetailTitle({ session, version }: SessionDetailTitleProps) {
  const creator = useMemo(() => version?.creator, [version?.creator]);

  const versionIndex = useMemo(() => {
    const index = version?.versionIndex || 0;
    return `V_${String(index).padStart(3, "0")}`;
  }, [version?.versionIndex]);

  const otherTags = useMemo(() => {
    const tags = (version?.tags || [])
      .filter((t: string) => !String(t).includes("needs:"))
      .map((t: string) => String(t).split(":")[1]);
    const bpm = version?.bpm ? `${version.bpm}BPM` : "";
    return [bpm, ...tags].filter(Boolean);
  }, [version?.tags, version?.bpm]);

  return (
    <div className="session-detail-title">
      {/* Creator with fade transition */}
      {creator && (
        <div key={creator} className="version-creator fade-enter-active">
          <Web3Avatar address={creator} className="creator-avatar" />
          <Web3Username address={creator} />
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
