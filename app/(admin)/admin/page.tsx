"use client";

import HelperContent from "@/components/admin/HelperContent/HelperContent";
import MemberTags from "@/components/admin/MemberTags/MemberTags";
import MembershipContract from "@/components/admin/MembershipContract/MembershipContract";
import RoleAdmin from "@/components/admin/RoleAdmin/RoleAdmin";
import RoleCreator from "@/components/admin/RoleCreator/RoleCreator";
import SessionTags from "@/components/admin/SessionTags/SessionTags";
import StemsPlayerCarousel from "@/components/admin/StemsPlayerCarousel/StemsPlayerCarousel";
import { useGetAddresses } from "@/hooks/query/query-hooks/use-get-addresses";

import "./page.scss";

export default function AdminPage() {
  const { data: members, isPending: isPendingMembers } = useGetAddresses();

  const creators = members?.addresses.filter((member) => member.isCreator);
  const admins = members?.addresses.filter((member) => member.isAdmin);

  return (
    <main className="admin-index">
      <div className="contained">
        <HelperContent />
        <h5 className="admin-title">Configuration</h5>
        <div className="controls-grid">
          <RoleAdmin admins={admins || []} isLoadingUsers={isPendingMembers} />
          <RoleCreator creators={creators || []} isLoadingUsers={isPendingMembers} />
          <SessionTags />
          <MemberTags />
          <MembershipContract />
          <StemsPlayerCarousel />
        </div>
      </div>
    </main>
  );
}
