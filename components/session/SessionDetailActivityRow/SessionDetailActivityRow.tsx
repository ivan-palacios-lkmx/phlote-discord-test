"use client";

import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
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
  created?:
    | {
        toDate?: () => Date;
        _seconds?: number;
        _nanoseconds?: number;
        [key: string]: unknown;
      }
    | string
    | Date
    | null;
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
  const { data: addressInfo } = useGetAddressInfo(initiator || "", !!initiator);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initiatorLink = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("profile", initiator);
    return `${pathname}?${current.toString()}`;
  }, [pathname, searchParams, initiator]);

  const dateTime = useMemo(() => {
    if (!created) return "";

    let date: Date | null = null;

    if (created instanceof Date) {
      date = created;
    } else if (typeof created === "string") {
      date = new Date(created);
    } else if (typeof created === "object") {
      if ("toDate" in created && typeof created.toDate === "function") {
        date = created.toDate();
      } else if ("_seconds" in created && typeof created._seconds === "number") {
        const seconds = created._seconds;
        const nanoseconds = (created._nanoseconds as number) || 0;
        date = new Date(seconds * 1000 + nanoseconds / 1000000);
      }
    }

    if (!date || isNaN(date.getTime())) return "";
    return format(date, "MM/DD hh:mmA");
  }, [created]);

  const actionType = useMemo(() => typeActionMap[type] || "", [type]);

  return (
    <div className="session-detail-activity-row">
      <div className="date-time">{dateTime}</div>
      <div className="action">
        <Link href={initiatorLink} className="initiator">
          <Web3Username username={addressInfo?.username || ""} />
        </Link>
        <span className="type">{actionType}</span>
      </div>
      <div className="version-index">{formattedIndex}</div>
    </div>
  );
}
