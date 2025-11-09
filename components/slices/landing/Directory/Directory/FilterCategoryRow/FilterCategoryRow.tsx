"use client";

import CloseIcon from "@/components/svg/close.svg";
import without from "lodash/without";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./FilterCategoryRow.scss";

interface FilterCategoryRowProps {
  slug: string;
  value: string;
  children?: React.ReactNode;
}

export default function FilterCategoryRow({ slug, value, children }: FilterCategoryRowProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get active values from URL
  const activeValues = useMemo(() => {
    const param = searchParams.get(slug);
    if (!param) return [];
    return param.split(",").filter(Boolean);
  }, [searchParams, slug]);

  // Check if current route is sessions
  const isSessions = useMemo(() => {
    return pathname?.includes("sessions") || false;
  }, [pathname]);

  // Check if this value is active
  const isActive = useMemo(() => {
    return activeValues.includes(value);
  }, [activeValues, value]);

  // Build link URL
  const linkTo = useMemo(() => {
    const current = new URLSearchParams(searchParams.toString());
    const items = isActive ? without(activeValues, value) : [...activeValues, value];

    if (items.length > 0) {
      current.set(slug, items.join(","));
    } else {
      current.delete(slug);
    }

    return `${pathname}?${current.toString()}`;
  }, [isActive, activeValues, value, slug, searchParams, pathname]);

  return (
    <div className="filter-category-row">
      <Link href={linkTo} className={`filter-category-button mono ${isActive ? "active" : ""}`}>
        {children || <span className="default-value">{value}</span>}
        <CloseIcon />
      </Link>

      {/* Count - TODO: Implement VirtualSessionCount and VirtualMemberCount */}
      {isSessions ? (
        <div className="virtual-session-count">
          {/* <VirtualSessionCount term={slug} value={value} /> */}
        </div>
      ) : (
        <div className="virtual-member-count">
          {/* <VirtualMemberCount term={slug} value={value} /> */}
        </div>
      )}
    </div>
  );
}
