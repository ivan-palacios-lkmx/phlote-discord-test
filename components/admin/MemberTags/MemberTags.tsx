"use client";

import GroupTagEditor from "@/components/admin/GroupTagEditor/GroupTagEditor";
import { useFbGlobals } from "@/hooks/useFbGlobals";
import { useMemo } from "react";

import "./MemberTags.scss";

interface Category {
  name: string;
  options: string[];
}

export default function MemberTags() {
  const { settingsDoc, updateSettings } = useFbGlobals();

  const dbCategories = useMemo(() => {
    return (settingsDoc as { availableMemberTags?: Category[] } | null)?.availableMemberTags || [];
  }, [settingsDoc]);

  const handleSave = async (data: Category[]) => {
    await updateSettings({
      availableMemberTags: data,
    });

    alert("Member Tags Saved");
  };

  return (
    <div className="admin-member-tags">
      <h6 className="area-label">Available Member Tags:</h6>
      <GroupTagEditor group={dbCategories} onSaved={handleSave} />
    </div>
  );
}
