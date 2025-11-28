"use client";

import CloseIcon from "@/components/icons/Close";
import VirtualMemberCount from "@/components/slices/landing/Directory/Directory/VirtualMemberCount/VirtualMemberCount";
import VirtualSessionCount from "@/components/slices/landing/Directory/Directory/VirtualSessionCount/VirtualSessionCount";
import useSessionFilters from "@/hooks/useSessionFilters";
import useTags from "@/hooks/useTags";
import without from "lodash/without";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./FilterTagRow.scss";

interface FilterTagRowProps {
  category: string;
  value: string;
}

export default function FilterTagRow({ category, value }: FilterTagRowProps) {
  const { tags: activeTags } = useSessionFilters();
  const { encodeTag } = useTags();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const encodedTag = useMemo(() => encodeTag(category, value), [category, value, encodeTag]);

  const isSessions = useMemo(() => {
    return pathname?.includes("sessions") || false;
  }, [pathname]);

  const isActive = useMemo(() => {
    return activeTags.includes(encodedTag);
  }, [activeTags, encodedTag]);

  const linkTo = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    const tags = isActive ? without(activeTags, encodedTag) : [...activeTags, encodedTag];

    if (tags.length > 0) {
      current.set("tags", tags.join(","));
    } else {
      current.delete("tags");
    }

    return `${pathname}?${current.toString()}`;
  }, [isActive, activeTags, encodedTag, searchParams, pathname]);

  return (
    <div className="filter-tag-row">
      <Link href={linkTo} className={`filter-tag-button mono ${isActive ? "active" : ""}`}>
        {value}
        <CloseIcon />
      </Link>

      {isSessions ? (
        <VirtualSessionCount term="tags" value={encodedTag} />
      ) : (
        <VirtualMemberCount term="tags" value={encodedTag} />
      )}
    </div>
  );
}
