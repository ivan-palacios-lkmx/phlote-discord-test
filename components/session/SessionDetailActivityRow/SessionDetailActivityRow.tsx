"use client";

import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { format } from "fecha";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./SessionDetailActivityRow.scss";

const typeActionMap: Record<string, string> = {
  PLAY: "Played",
  DOWNLOAD: "Downloaded",
};

interface SessionDetailActivityRowProps {
  created?: {
    toDate?: () => Date;
    [key: string]: unknown;
  } | null;
  initiator?: string;
  type?: string;
  formattedIndex?: string;
}

export default function SessionDetailActivityRow({
  created,
  initiator = "",
  type = "",
  formattedIndex = "",
}: SessionDetailActivityRowProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initiatorLink = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("profile", initiator);
    return `${pathname}?${current.toString()}`;
  }, [pathname, searchParams, initiator]);

  const dateTime = useMemo(() => {
    if (!created || typeof created !== "object" || !("toDate" in created)) return "";
    const d = created.toDate?.();
    if (!d) return "";
    return format(d, "MM/DD hh:mmA");
  }, [created]);

  const actionType = useMemo(() => typeActionMap[type] || "", [type]);

  return (
    <div className="session-detail-activity-row">
      <div className="date-time">{dateTime}</div>
      <div className="action">
        <Link href={initiatorLink} className="initiator">
          <Web3Username address={initiator} />
        </Link>
        <span className="type">{actionType}</span>
      </div>
      <div className="version-index">{formattedIndex}</div>
    </div>
  );
}
