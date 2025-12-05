"use client";

import VersionPlayer from "@/components/VersionPlayer/VersionPlayer";
import { VersionDocWithID } from "@/types/database";

interface SessionDetailPlayerProps {
  version: VersionDocWithID;
}

export default function SessionDetailPlayer({ version }: SessionDetailPlayerProps) {
  return (
    <div className="session-detail-player">
      {version && <VersionPlayer versionData={version} />}
    </div>
  );
}
