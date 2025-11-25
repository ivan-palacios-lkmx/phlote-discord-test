"use client";

import OnlyAdmins from "@/components/OnlyAdmins/OnlyAdmins";
import HelperContent from "@/components/admin/HelperContent/HelperContent";
import MemberTags from "@/components/admin/MemberTags/MemberTags";
import MembershipContract from "@/components/admin/MembershipContract/MembershipContract";
import RoleAdmin from "@/components/admin/RoleAdmin/RoleAdmin";
import RoleCreator from "@/components/admin/RoleCreator/RoleCreator";
import SessionTags from "@/components/admin/SessionTags/SessionTags";
import StemsPlayerCarousel from "@/components/admin/StemsPlayerCarousel/StemsPlayerCarousel";

import "./page.scss";

export default function AdminPage() {
  return (
    <main className="admin-index">
      <div className="contained">
        <HelperContent />

        <h5 className="admin-title">Configuration</h5>

        <div className="controls-grid">
          <RoleAdmin />
          <RoleCreator />

          <SessionTags />
          <MemberTags />

          <MembershipContract />
          <StemsPlayerCarousel />
        </div>
      </div>
    </main>
  );
}
