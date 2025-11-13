"use client";

import { useLatestVersion } from "@/hooks/sessions/useLatestVersion";
import { format } from "fecha";
import Link from "next/link";
import { useMemo } from "react";

import "./ContributedRow.scss";

interface ContributedRowProps {
  objectID?: string;
  name?: string;
  created?: number;
  creator?: string;
}

export default function ContributedRow({ objectID, name, creator }: ContributedRowProps) {
  const versionDoc = useLatestVersion(objectID, creator || "");

  const versionIndex = useMemo(() => {
    const idx = String(versionDoc?.versionIndex || "");
    return `V${idx.padStart(3, "0")}`;
  }, [versionDoc?.versionIndex]);

  const linkTo = useMemo(() => {
    if (!objectID) return "/sessions";
    const v = versionDoc?.versionIndex;
    return v ? `/sessions/${objectID}?v=${v}` : `/sessions/${objectID}`;
  }, [objectID, versionDoc?.versionIndex]);

  const formattedDate = useMemo(() => {
    if (!versionDoc?.created) return "";
    const createdField = versionDoc.created;
    if (
      typeof createdField === "object" &&
      createdField !== null &&
      "toDate" in createdField &&
      typeof createdField.toDate === "function"
    ) {
      const d = createdField.toDate();
      return format(d, "M/D/YY");
    }
    return "";
  }, [versionDoc?.created]);

  return (
    <Link href={linkTo} className="overlay-profile-contributed-row">
      <div className="version">{versionIndex}</div>
      <div className="name">{name}</div>
      <div className="date">{formattedDate}</div>
    </Link>
  );
}
