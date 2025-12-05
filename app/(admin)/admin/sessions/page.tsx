"use client";

import OnlyAdmins from "@/components/OnlyAdmins/OnlyAdmins";
import SessionCard from "@/components/admin/SessionCard/SessionCard";
import { useDeleteSession } from "@/hooks/query/mutations/use-delete-session";
import { useGetSessions } from "@/hooks/query/query-hooks/use-get-sessions";
import { SessionDocWithID } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense } from "react";

function SessionsContent() {
  const queryClient = useQueryClient();
  const { data: sessions, isPending: isPendingSessions } = useGetSessions();
  const { mutate: deleteSession } = useDeleteSession();
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(
      { sessionId },
      {
        onSuccess: () => {
          queryClient.setQueriesData<SessionDocWithID[]>({ queryKey: ["sessions"] }, (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((session) => session.id !== sessionId);
          });
        },
      },
    );
  };

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
              <SessionCard
                key={session.id}
                session={session}
                onDeleteSession={() => handleDeleteSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </OnlyAdmins>
  );
}

export default function Sessions() {
  return (
    <Suspense fallback={null}>
      <SessionsContent />
    </Suspense>
  );
}
