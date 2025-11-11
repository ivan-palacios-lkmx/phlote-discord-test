"use client";

import SessionDetailActivityRow from "@/components/session/SessionDetailActivityRow/SessionDetailActivityRow";
import { useActivity } from "@/hooks/sessions/useActivity";
import { useMemo } from "react";

import "./SessionDetailActivity.scss";

interface SessionDetailActivityProps {
  sessionID?: string;
  versions?: Array<{
    id?: string;
    versionIndex?: number;
    [key: string]: unknown;
  }>;
}

export default function SessionDetailActivity({
  sessionID,
  versions = [],
}: SessionDetailActivityProps) {
  const activity = useActivity(sessionID);

  const versionIdMap = useMemo(() => {
    return (versions || []).reduce(
      (map, version) => {
        if (version.id && version.versionIndex !== undefined) {
          map[version.id] = `V${String(version.versionIndex).padStart(3, "0")}`;
        }
        return map;
      },
      {} as Record<string, string>,
    );
  }, [versions]);

  return (
    <div className="session-detail-activity">
      <div className="activity-box" data-lenis-prevent>
        <div className="activity-title">Activity</div>
        <div className="activity-feed">
          {activity.map((item) => (
            <SessionDetailActivityRow
              key={item.id}
              created={item.created as { toDate?: () => Date; [key: string]: unknown } | null}
              initiator={(item.initiator as string) || ""}
              type={(item.type as string) || ""}
              formattedIndex={versionIdMap[(item.versionID as string) || ""] || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
