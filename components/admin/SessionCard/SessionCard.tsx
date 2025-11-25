"use client";

import SessionsCardRow from "@/components/admin/SessionsCardRow/SessionsCardRow";
import { useGetVersions } from "@/hooks/query/query-hooks/use-get-versions";
import { SessionDocWithID } from "@/types/database";

import "./SessionCard.scss";

interface SessionCardProps {
  session: SessionDocWithID | null | undefined;
}

export default function SessionCard({ session }: SessionCardProps) {
  const {
    data: versions,
    isPending: isPendingVersions,
    isError: isErrorVersions,
  } = useGetVersions({ sessionId: session?.id || "" });

  const onDelete = async () => {};

  return (
    <div className="session-card">
      <div className="card-header">
        <h6 className="card-header-title">{session?.name || ""}</h6>
        <button onClick={onDelete} className="btn delete-session" type="button">
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
