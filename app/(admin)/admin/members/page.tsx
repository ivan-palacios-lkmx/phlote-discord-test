"use client";

import MemberCard from "@/components/admin/MemberCard/MemberCard";
import { useGetAddresses } from "@/hooks/query/query-hooks/use-get-addresses";
import Link from "next/link";

import "./Members.scss";

export default function Members() {
  const { data: members, isPending: isPendingMembers } = useGetAddresses();
  return (
    <main className="admin-members">
      <div className="contained">
        <h4 className="admin-title">Manage Members</h4>
        <div className="subtitle">
          <Link href="/admin">Back to admin</Link>
        </div>

        {isPendingMembers ? (
          <div>Loading members...</div>
        ) : (
          <div className="member-grid">
            {members?.addresses
              .filter((member) => member.id)
              .map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
