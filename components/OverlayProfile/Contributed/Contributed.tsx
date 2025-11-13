"use client";

import ContributedRow from "@/components/OverlayProfile/ContributedRow/ContributedRow";
import useSessions from "@/hooks/useSessions";
import { useMemo } from "react";

import "./Contributed.scss";

interface ContributedProps {
  address?: string;
}

export default function Contributed({ address }: ContributedProps) {
  const contributors = useMemo(() => (address ? [address] : []), [address]);

  const { sessions, totalResults } = useSessions({
    collaborators: contributors,
    pageSize: 20,
  });

  if (sessions.length === 0) return null;

  return (
    <div className="overlay-profile-contributed">
      <h6 className="sessions-contributed-title">
        <span>Sessions Contributed</span>&nbsp;
        <span>({totalResults})</span>
      </h6>
      <div className="contributed-session-list">
        {sessions.map((session) => (
          <ContributedRow
            key={session.objectID}
            objectID={session.objectID}
            name={session.name as string | undefined}
            creator={session.creator as string | undefined}
          />
        ))}
      </div>
    </div>
  );
}
