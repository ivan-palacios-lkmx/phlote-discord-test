"use client";

import CreatedRow from "@/components/OverlayProfile/CreatedRow/CreatedRow";
import useSessions from "@/hooks/useSessions";
import { useMemo } from "react";

import "./Created.scss";

interface CreatedProps {
  address?: string;
}

export default function Created({ address }: CreatedProps) {
  const creators = useMemo(() => (address ? [address] : []), [address]);

  const { sessions, totalResults } = useSessions({
    creators,
    pageSize: 10,
  });

  if (sessions.length === 0) return null;

  return (
    <div className="overlay-profile-created">
      <h6 className="sessions-created-title">
        <span>Sessions Created</span>&nbsp;
        <span>({totalResults})</span>
      </h6>
      <div className="created-session-list">
        {sessions.map((session) => (
          <CreatedRow
            key={session.objectID}
            objectID={session.objectID}
            name={session.name as string | undefined}
            created={session.created as unknown as number | undefined}
          />
        ))}
      </div>
    </div>
  );
}
