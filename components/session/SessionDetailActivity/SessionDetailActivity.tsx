"use client";

import SessionDetailActivityRow from "@/components/session/SessionDetailActivityRow/SessionDetailActivityRow";
import { useGetSessionActivity } from "@/hooks/query/query-hooks/use-get-session-activity";
import { VersionDocWithID } from "@/types/database";
import { useMemo } from "react";

import "./SessionDetailActivity.scss";

interface SessionDetailActivityProps {
  sessionID?: string;
  versions?: VersionDocWithID[];
}

export default function SessionDetailActivity({
  sessionID,
  versions = [],
}: SessionDetailActivityProps) {
  const { data: activity } = useGetSessionActivity(sessionID || "");

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
          {activity?.map((item) => (
            <SessionDetailActivityRow
              key={item.id}
              created={item.created}
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
