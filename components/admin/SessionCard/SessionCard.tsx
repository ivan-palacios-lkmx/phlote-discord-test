"use client";

import SessionsCardRow from "@/components/admin/SessionsCardRow/SessionsCardRow";
import { useGetVersions } from "@/hooks/query/query-hooks/use-get-versions";
import { SessionDocWithID } from "@/types/database";

import "./SessionCard.scss";

interface SessionCardProps {
  session: SessionDocWithID | null | undefined;
  onDelete: (sessionId: string) => void;
}

export default function SessionCard({ session, onDelete }: SessionCardProps) {
  const {
    data: versions,
    isPending: isPendingVersions,
    isError: isErrorVersions,
  } = useGetVersions({ sessionId: session?.id || "" });

  return (
    <div className="session-card">
      <div className="card-header">
        <h6 className="card-header-title">{session?.name || ""}</h6>
        <button
          onClick={() => onDelete(session?.id || "")}
          className="btn delete-session"
          type="button">
          Delete Session
        </button>
      </div>
      <div className="card-version-list">
        {isPendingVersions ? (
          <div className="loading">Loading...</div>
        ) : isErrorVersions ? (
          <div className="error">Error loading versions</div>
        ) : (
          versions.map((version) => <SessionsCardRow key={version.id} version={version} />)
        )}
      </div>
    </div>
  );
}
