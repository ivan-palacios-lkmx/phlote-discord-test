"use client";

import Chevron from "@/components/icons/Chevron";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
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

  const { data: addressInfo } = useGetAddressInfo(creator || "", false, !!creator);
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

  // Build link URL
  const linkTo = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("v", versionIndex.toString());
    return `${pathname}?${current.toString()}`;
  }, [pathname, searchParams, versionIndex]);

  return (
    <div className={classes}>
      <Chevron className="arrow" />
      <div className="headless-arrow" />
      <Link href={linkTo} className="version-block">
        <div className="block-info">
          <div className="block-title">{formattedIndex}</div>
          <div className="block-info-row">
            <Web3Username username={addressInfo?.username || ""} />
          </div>
          <div className="block-info-row">
            <span>{downloadCount} Downloads</span>
          </div>
        </div>
        <div className="block-creator">
          <Web3Avatar
            className="creator-avatar"
            avatar={addressInfo?.avatar || "/images/phlote-poster.jpg"}
          />
        </div>
      </Link>
    </div>
  );
}
