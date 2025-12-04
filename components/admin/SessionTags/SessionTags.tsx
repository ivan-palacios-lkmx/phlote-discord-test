"use client";

import GroupTagEditor from "@/components/admin/GroupTagEditor/GroupTagEditor";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { useUpdateTags } from "@/hooks/query/mutations/use-update-tags";
import { TagCategory } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import "./SessionTags.scss";

export default function SessionTags() {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    data: availableSessionTags,
    isPending: isLoadingSessionTags,
    isError: isErrorSessionTags,
  } = useGetTags({ category: "session" });

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
        category: "session",
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tags", "session"] });
          queryClient.invalidateQueries({ queryKey: ["settings"] });
          setShowSuccess(true);
        },
        onError: (error) => {
          console.error("Error saving session tags:", error);
          alert("Error al guardar los tags. Por favor, intenta de nuevo.");
        },
      },
    );
  };

  return (
    <div className="admin-session-tags">
      <h6 className="area-label">Available Session Tags:</h6>
      {showSuccess && (
        <div className="success-message">Session Tags saved</div>
      )}
      {isLoadingSessionTags ? (
        <div className="loading-tags" />
      ) : isErrorSessionTags ? (
        <div className="error-tags" />
      ) : (
        <GroupTagEditor group={availableSessionTags} onSaved={handleSave} />
      )}
    </div>
  );
}
