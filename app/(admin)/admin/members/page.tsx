"use client";

import OnlyAdmins from "@/components/OnlyAdmins/OnlyAdmins";
import MemberCard from "@/components/admin/MemberCard/MemberCard";
import { useGetAddresses } from "@/hooks/query/query-hooks/use-get-addresses";
import Link from "next/link";
import { Suspense } from "react";

function MembersContent() {
  const { data: members, isPending: isPendingMembers } = useGetAddresses({ role: "member" });
  return (
    <OnlyAdmins className="admin-members">
      <div className="contained">
        <h4 className="admin-title">Manage Members</h4>
        <div className="subtitle">
          <Link href="/admin">Back to admin</Link>
        </div>

        {isPendingMembers ? (
          <div>Loading members...</div>
        ) : (
          <div className="member-grid">
            {members?.addresses.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </OnlyAdmins>
  );
}

export default function Members() {
  return (
    <Suspense fallback={null}>
      <MembersContent />
    </Suspense>
  );
}
