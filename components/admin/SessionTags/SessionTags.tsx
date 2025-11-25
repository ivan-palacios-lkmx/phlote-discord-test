"use client";

import GroupTagEditor from "@/components/admin/GroupTagEditor/GroupTagEditor";
import { useFbGlobals } from "@/hooks/useFbGlobals";
import { useMemo } from "react";

import "./SessionTags.scss";

interface Category {
  name: string;
  options: string[];
}

export default function SessionTags() {
  const { settingsDoc, updateSettings } = useFbGlobals();

  const dbCategories = useMemo(() => {
    return (settingsDoc as { availableSessionTags?: Category[] } | null)?.availableSessionTags || [];
  }, [settingsDoc]);

  const handleSave = async (data: Category[]) => {
    await updateSettings({
      availableSessionTags: data,
    });

    alert("Session Tags Saved");
  };

  return (
    <div className="admin-session-tags">
      <h6 className="area-label">Available Session Tags:</h6>
      <GroupTagEditor group={dbCategories} onSaved={handleSave} />
    </div>
  );
}
