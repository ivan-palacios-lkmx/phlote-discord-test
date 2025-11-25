"use client";

import GroupTagEditor from "@/components/admin/GroupTagEditor/GroupTagEditor";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { TagCategory } from "@/types/database";

import "./SessionTags.scss";

export default function SessionTags() {
  const {
    data: availableSessionTags,
    isPending: isLoadingSessionTags,
    isError: isErrorSessionTags,
  } = useGetTags({ category: "session" });

  const handleSave = async (data: TagCategory[]) => {
    alert("Session Tags Saved");
  };

  return (
    <div className="admin-session-tags">
      <h6 className="area-label">Available Session Tags:</h6>
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
