"use client";

import OnlyAdmins from "@/components/OnlyAdmins/OnlyAdmins";
import SessionCard from "@/components/admin/SessionCard/SessionCard";
import { useGetSessions } from "@/hooks/query/query-hooks/use-get-sessions";
import Link from "next/link";

import "./Sessions.scss";

export default function Sessions() {
  const { data: sessions, isPending: isPendingSessions } = useGetSessions();

  return (
    <OnlyAdmins className="admin-sessions">
      <div className="contained">
        <h4 className="admin-title">Manage Sessions</h4>
        <div className="subtitle">
          <Link href="/admin">Back to admin</Link>
        </div>

        {isPendingSessions ? (
          <div>Loading sessions...</div>
        ) : (
          <div className="session-grid">
            {sessions?.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </OnlyAdmins>
  );
}
