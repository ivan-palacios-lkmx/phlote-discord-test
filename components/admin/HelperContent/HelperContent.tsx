"use client";

import { useMemo } from "react";

import "./HelperContent.scss";

interface HelperContentItem {
  title: string;
  content: string;
}

function useAdminDoc() {
  // TODO: Implement useAdminDoc hook similar to useFbGlobals
  // const adminDocRef = useMemo(() => doc(db, "globals/admin"), []);
  // const adminDoc = useClientDoc(adminDocRef);
  const adminDoc = null;

  return { adminDoc };
}

export default function HelperContent() {
  const { adminDoc } = useAdminDoc();

  const items = useMemo(() => {
    return (adminDoc as { helperContent?: HelperContentItem[] } | null)?.helperContent || [];
  }, [adminDoc]);

  return (
    <div className="admin-helper-content">
      {items.map((item, index) => (
        <div key={index} className="helper-content-item">
          <h6 className="helper-title">{item.title}</h6>
          <div className="entry" dangerouslySetInnerHTML={{ __html: item.content }} />
        </div>
      ))}
    </div>
  );
}
