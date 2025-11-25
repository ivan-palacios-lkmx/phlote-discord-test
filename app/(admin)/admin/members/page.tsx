"use client";

import OnlyAdmins from "@/components/OnlyAdmins/OnlyAdmins";
import MemberCard from "@/components/admin/MemberCard/MemberCard";
import { useClientCollection } from "@/hooks/sessions/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { useMemo } from "react";

import "./Members.scss";

export default function Members() {
  const memberQ = useMemo(() => {
    return query(collection(db, "addresses"), where("isMember", "==", true));
  }, []);

  const { data: members, pending } = useClientCollection(memberQ);

  return (
    <OnlyAdmins className="admin-members">
      <div className="contained">
        <h4 className="admin-title">Manage Members</h4>
        <div className="subtitle">
          <Link href="/admin">Back to admin</Link>
        </div>

        {pending ? (
          <div>Loading members...</div>
        ) : (
          <div className="member-grid">
            {members
              .filter((member) => member.id)
              .map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
          </div>
        )}
      </div>
    </OnlyAdmins>
  );
}
