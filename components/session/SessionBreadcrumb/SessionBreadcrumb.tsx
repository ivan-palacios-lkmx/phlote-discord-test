"use client";

import Link from "next/link";

interface SessionBreadcrumbProps {
  name?: string;
}

export default function SessionBreadcrumb({ name = "" }: SessionBreadcrumbProps) {
  return (
    <div className="session-detail-breadcrumb">
      <Link href="/sessions">Session Index</Link>
      <span className="slash">/</span>
      <span className="current-session">{name}</span>
    </div>
  );
}
