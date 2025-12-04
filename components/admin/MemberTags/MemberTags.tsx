"use client";

import GroupTagEditor from "@/components/admin/GroupTagEditor/GroupTagEditor";
import { useUpdateTags } from "@/hooks/query/mutations/use-update-tags";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { TagCategory } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import "./MemberTags.scss";

export default function MemberTags() {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    data: availableMemberTags,
    isPending: isLoadingMemberTags,
    isError: isErrorMemberTags,
  } = useGetTags({ category: "member" });

  const { mutate: updateTags, isPending: isSaving } = useUpdateTags();

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSave = async (data: TagCategory[]) => {
    updateTags(
      {
        categories: data,
        category: "member",
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tags", "member"] });
          queryClient.invalidateQueries({ queryKey: ["settings"] });
          setShowSuccess(true);
        },
        onError: (error) => {
          console.error("Error saving member tags:", error);
          alert("Error al guardar los tags. Por favor, intenta de nuevo.");
        },
      },
    );
  };

  return (
    <div className="admin-member-tags">
      <h6 className="area-label">Available Member Tags:</h6>
      {showSuccess && <div className="success-message">Member Tags saved</div>}
      {isLoadingMemberTags ? (
        <div className="loading-tags" />
      ) : isErrorMemberTags ? (
        <div className="error-tags" />
      ) : (
        <GroupTagEditor group={availableMemberTags} onSaved={handleSave} />
      )}
    </div>
  );
}
