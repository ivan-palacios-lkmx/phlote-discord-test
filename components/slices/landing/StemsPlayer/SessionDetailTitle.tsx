"use client";

import Web3Username from "@/components/slices/landing/Directory/Web3Username";
import { useMemo } from "react";

import Web3Avatar from "./Web3Avatar";

interface SessionDetailTitleProps {
  session: {
    name?: string;
    [key: string]: unknown;
  } | null;
  version: {
    creator?: string;
    versionIndex?: number | string;
    tags?: string[];
    bpm?: number | string;
    [key: string]: unknown;
  } | null;
}

export default function SessionDetailTitle({ session, version }: SessionDetailTitleProps) {
  const creator = useMemo(() => version?.creator, [version?.creator]);

  const versionIndex = useMemo(() => {
    const index = version?.versionIndex || "";
    return `V_${String(index).padStart(3, "0")}`;
  }, [version?.versionIndex]);

  const otherTags = useMemo(() => {
    const tags = (version?.tags || [])
      .filter((t) => !String(t).includes("needs:"))
      .map((t) => String(t).split(":")[1]);
    const bpm = version?.bpm ? `${version.bpm}BPM` : "";
    return [bpm, ...tags].filter(Boolean);
  }, [version?.tags, version?.bpm]);

  return (
    <div className="session-detail-title border-b border-white/30 pb-[var(--margin)]">
      {creator && (
        <div className="version-creator grid grid-cols-[35px_auto] items-center gap-[10px] mb-5 transition-opacity duration-300">
          <Web3Avatar
            address={creator}
            className="creator-avatar border border-white rounded-full relative overflow-hidden after:content-[''] after:pb-[100%] after:block"
          />
          <Web3Username address={creator} />
        </div>
      )}

      <div className="detail-title-area overflow-hidden md:mb-[10px]">
        <h2 className="detail-title inline align-top leading-[100%] m-0 md:text-[40px]">
          {session?.name || ""}
        </h2>
        <span className="version-index inline text-[35px] leading-[100%] ml-[15px] transition-opacity duration-300 md:text-[20px]">
          {versionIndex}
        </span>
      </div>

      <div className="tag-area transition-opacity duration-300">
        {otherTags.map((tag, index) => (
          <span
            key={index}
            className="single-tag inline-block font-mono py-[0.3em] px-4 mr-[5px] mb-[5px] border border-white/40 rounded-[5px]">
            {tag}
          </span>
        ))}
        <span
          className="single-tag decoy inline-block font-mono py-[0.3em] px-4 mr-[5px] mb-[5px] border border-white/40 rounded-[5px] opacity-0"
          aria-hidden>
          &nbsp;
        </span>
      </div>
    </div>
  );
}
