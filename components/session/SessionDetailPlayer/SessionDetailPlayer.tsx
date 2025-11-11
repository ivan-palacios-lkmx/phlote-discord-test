"use client";

import VersionPlayer from "@/components/VersionPlayer/VersionPlayer";
import type { Version } from "@/types/client";

import "./SessionDetailPlayer.scss";

interface SessionDetailPlayerProps {
  version?: Version | null;
}

export default function SessionDetailPlayer({ version }: SessionDetailPlayerProps) {
  return (
    <div className="session-detail-player">
      {version && <VersionPlayer versionData={version} />}
    </div>
  );
}
