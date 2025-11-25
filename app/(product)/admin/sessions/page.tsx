"use client";

import OnlyAdmins from "@/components/OnlyAdmins/OnlyAdmins";
import SessionCard from "@/components/admin/SessionCard/SessionCard";
import { useClientCollection } from "@/hooks/sessions/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, query } from "firebase/firestore";
import Link from "next/link";
import { useMemo } from "react";

import "./sessions.scss";

export default function Sessions() {
  const sessionQ = useMemo(() => {
    return query(collection(db, "sessions"));
  }, []);

  const { data: sessions, pending } = useClientCollection(sessionQ);

  return (
    <OnlyAdmins className="admin-sessions">
      <div className="contained">
        <h4 className="admin-title">Manage Sessions</h4>
        <div className="subtitle">
          <Link href="/admin">Back to admin</Link>
        </div>

        {pending ? (
          <div>Loading sessions...</div>
        ) : (
          <div className="session-grid">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </OnlyAdmins>
  );
}
