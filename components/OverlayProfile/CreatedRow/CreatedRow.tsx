"use client";

import { format } from "fecha";
import Link from "next/link";
import { useMemo } from "react";

import "./CreatedRow.scss";

interface CreatedRowProps {
  objectID?: string;
  name?: string;
  created?: number;
}

export default function CreatedRow({ objectID, name, created }: CreatedRowProps) {
  const linkTo = useMemo(() => {
    if (!objectID) return "/sessions";
    return `/sessions/${objectID}?v=1`;
  }, [objectID]);

  const formattedDate = useMemo(() => {
    if (!created) return "";
    const d = new Date(created);
    return format(d, "M/D/YY");
  }, [created]);

  return (
    <Link href={linkTo} className="overlay-profile-created-row">
      <div className="version">V001</div>
      <div className="name">{name}</div>
      <div className="date">{formattedDate}</div>
    </Link>
  );
}
