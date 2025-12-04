"use client";

import linkResolver from "@/utils/prismic-link-resolver";
import { asLink } from "@prismicio/client";
import type { LinkField } from "@prismicio/client";
import Link from "next/link";

interface PrismicLinkProps {
  field: LinkField;
  children: React.ReactNode;
  className?: string;
}

export default function PrismicLink({ field, children, className = "" }: PrismicLinkProps) {
  if (!field) {
    return <>{children}</>;
  }

  const url = asLink(field, { linkResolver }) || "#";

  if (!url || url === "#") {
    return <>{children}</>;
  }

  const isExternal = url.startsWith("http://") || url.startsWith("https://");
  const isAnchor = url.startsWith("#");
  const isMailto = url.startsWith("mailto:");
  const isTel = url.startsWith("tel:");

  if (isExternal || isAnchor || isMailto || isTel) {
    return (
      <a
        href={url}
        className={className}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  }

  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
}
