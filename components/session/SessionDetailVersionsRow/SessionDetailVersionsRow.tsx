"use client";

import ChevronIcon from "@/components/svg/chevron.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./SessionDetailVersionsRow.scss";

interface SessionDetailVersionsRowProps {
  versionIndex?: number;
  creator?: string;
  downloadCount?: number;
  active?: boolean;
  included?: boolean;
  withinRange?: boolean;
  id?: string;
}

export default function SessionDetailVersionsRow({
  versionIndex = 0,
  creator = "",
  downloadCount = 0,
  active = false,
  included = false,
  withinRange = false,
}: SessionDetailVersionsRowProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build classes
  const classes = useMemo(() => {
    return [
      "session-detail-versions-row",
      active ? "active" : "",
      included ? "included" : "",
      withinRange ? "within-range" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [active, included, withinRange]);

  // Format version index
  const formattedIndex = useMemo(() => {
    return `V_${String(versionIndex).padStart(3, "0")}`;
  }, [versionIndex]);

  // Creator address
  const creatorAddress = useMemo(() => creator, [creator]);

  // Build link URL
  const linkTo = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("v", versionIndex.toString());
    return `${pathname}?${current.toString()}`;
  }, [pathname, searchParams, versionIndex]);

  return (
    <div className={classes}>
      <ChevronIcon className="arrow" />
      <div className="headless-arrow" />
      <Link href={linkTo} className="version-block">
        <div className="block-info">
          <div className="block-title">{formattedIndex}</div>
          <div className="block-info-row">
            <Web3Username address={creatorAddress} />
          </div>
          <div className="block-info-row">
            <span>{downloadCount} Downloads</span>
          </div>
        </div>
        <div className="block-creator">
          <Web3Avatar className="creator-avatar" address={creatorAddress} />
        </div>
      </Link>
    </div>
  );
}
