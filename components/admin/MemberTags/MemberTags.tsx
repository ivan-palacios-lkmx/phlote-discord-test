"use client";

import GroupTagEditor from "@/components/admin/GroupTagEditor/GroupTagEditor";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { TagCategory } from "@/types/database";

import "./MemberTags.scss";

export default function MemberTags() {
  const {
    data: availableMemberTags,
    isPending: isLoadingMemberTags,
    isError: isErrorMemberTags,
  } = useGetTags({ category: "member" });

  const handleSave = async (data: TagCategory[]) => {
    alert("Member Tags Saved");
  };

  return (
    <div className="admin-member-tags">
      <h6 className="area-label">Available Member Tags:</h6>
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
