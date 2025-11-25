"use client";

import SessionsCardRow from "@/components/admin/SessionsCardRow/SessionsCardRow";
import { useClientCollection } from "@/hooks/sessions/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, doc, orderBy, query, runTransaction, where } from "firebase/firestore";
import { useMemo } from "react";

import "./SessionCard.scss";

interface Session {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

interface SessionCardProps {
  session: Session | null | undefined;
}

export default function SessionCard({ session }: SessionCardProps) {
  const versionQ = useMemo(() => {
    if (!session?.id) return null;

    return query(
      collection(db, "session-versions"),
      where("sessionID", "==", session.id),
      orderBy("created", "desc"),
    );
  }, [session?.id]);

  const { data: versions } = useClientCollection(versionQ);

  const onDelete = async () => {
    if (!session?.id) return;

    await runTransaction(db, async (transaction) => {
      await Promise.all(
        versions.map((version) => transaction.delete(doc(db, `session-versions/${version.id}`))),
      );

      await transaction.delete(doc(db, `sessions/${session.id}`));
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="session-card">
      <div className="card-header">
        <h6 className="card-header-title">{session.name || ""}</h6>
        <button onClick={onDelete} className="btn delete-session" type="button">
          Delete Session
        </button>
      </div>
      <div className="card-version-list">
        {versions.map((version) => (
          <SessionsCardRow key={version.id} version={version} />
        ))}
      </div>
    </div>
  );
}
