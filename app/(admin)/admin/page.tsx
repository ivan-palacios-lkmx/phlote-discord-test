"use client";

import HelperContent from "@/components/admin/HelperContent/HelperContent";
import MemberTags from "@/components/admin/MemberTags/MemberTags";
import MembershipContract from "@/components/admin/MembershipContract/MembershipContract";
import RoleAdmin from "@/components/admin/RoleAdmin/RoleAdmin";
import RoleCreator from "@/components/admin/RoleCreator/RoleCreator";
import SessionTags from "@/components/admin/SessionTags/SessionTags";
import StemsPlayerCarousel from "@/components/admin/StemsPlayerCarousel/StemsPlayerCarousel";
import { useDeleteAdmin } from "@/hooks/query/mutations/use-delete-admin";
import { useDeleteCreator } from "@/hooks/query/mutations/use-delete-creator";
import { useGetAdmins } from "@/hooks/query/query-hooks/use-get-admins";
import { useGetCreators } from "@/hooks/query/query-hooks/use-get-creators";
import { AddressDocWithID } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";

import "./page.scss";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { data: admins, isPending: isPendingAdmins } = useGetAdmins();
  const { data: creators, isPending: isPendingCreators } = useGetCreators();
  const { mutate: deleteAdmin } = useDeleteAdmin();
  const { mutate: deleteCreator } = useDeleteCreator();

  const handleRemoveAdmin = (address: AddressDocWithID) => {
    deleteAdmin(
      { address: address.id },
      {
        onSuccess: () => {
          queryClient.setQueriesData<AddressDocWithID[]>({ queryKey: ["admins"] }, (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((admin) => admin.id !== address.id);
          });
        },
      },
    );
  };

  const handleRemoveCreator = (address: AddressDocWithID) => {
    deleteCreator(
      { address: address.id },
      {
        onSuccess: () => {
          queryClient.setQueriesData<AddressDocWithID[]>({ queryKey: ["creators"] }, (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((creator) => creator.id !== address.id);
          });
        },
      },
    );
  };

  return (
    <main className="admin-index">
      <div className="contained">
        <HelperContent />
        <h5 className="admin-title">Configuration</h5>
        <div className="controls-grid">
          <RoleAdmin
            admins={admins || []}
            isLoadingUsers={isPendingAdmins}
            onRemoveAdmin={handleRemoveAdmin}
          />
          <RoleCreator
            creators={creators || []}
            isLoadingUsers={isPendingCreators}
            onRemoveCreator={handleRemoveCreator}
          />
          <SessionTags />
          <MemberTags />
          <MembershipContract />
          <StemsPlayerCarousel />
        </div>
      </div>
    </main>
  );
}
