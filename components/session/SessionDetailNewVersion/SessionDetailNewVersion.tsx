"use client";

import Link from "next/link";
import { useMemo } from "react";

interface SessionDetailNewVersionProps {
  sessionID?: string;
  versionID?: string;
}

export default function SessionDetailNewVersion({
  sessionID,
  versionID,
}: SessionDetailNewVersionProps) {
  const linkTo = useMemo(() => {
    if (!sessionID) return "/sessions";
    const params = new URLSearchParams();
    if (versionID) {
      params.set("versionID", versionID);
    }
    const queryString = params.toString();
    return `/sessions/${sessionID}/new${queryString ? `?${queryString}` : ""}`;
  }, [sessionID, versionID]);

  return (
    <div className="session-detail-new-version">
      <div className="new-version-title">Versions</div>
      <Link href={linkTo} className="btn new-version">
        + Submit New Version
      </Link>
    </div>
  );
}
