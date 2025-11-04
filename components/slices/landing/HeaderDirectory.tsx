"use client";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useRef } from "react";

const FilterButton = ({
  children,
  active,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] border transition-colors ${
      active ? "border-white/50 bg-white/10" : "border-white/30"
    } ${className}`}>
    {children}
    {/* Placeholder for close icon */}
    {active && <span className="text-[10px]">×</span>}
  </button>
);

interface HeaderDirectoryProps {
  totalResults: number;
  activeFilters: Array<{
    slug: string;
    value: string;
    name: string;
  }>;
  removeFilter: (slug: string, value: string) => void;
  sortValue: string;
  setSortValue: (value: string) => void;
  onFilterClick: () => void;
}

export default function HeaderDirectory({
  totalResults,
  activeFilters,
  removeFilter,
  sortValue,
  setSortValue,
  onFilterClick,
}: HeaderDirectoryProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="header sticky top-0 z-10 bg-white border-b border-black/30 py-2 flex justify-between items-center"
      ref={headerRef}>
      <div className="active-filters flex items-center gap-2 overflow-hidden flex-1">
        <h6 className="font-condensed text-sm whitespace-nowrap m-0">({totalResults}) People</h6>

        <div className="flex items-center gap-2">
          {activeFilters.map((filter, index) => (
            <FilterButton
              key={`${filter.slug}-${filter.value}-${index}`}
              active
              onClick={() => removeFilter(filter.slug, filter.value)}>
              {filter.name}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="filter-sort flex items-center gap-2 relative">
        <span className="hidden md:block text-[11px] font-mono">Sort By</span>

        <Select
          selectOptions={[
            { value: "all", label: "all" },
            { value: "recent", label: "recent" },
            { value: "most active", label: "most active" },
          ]}
          value={sortValue}
          onChange={(value) => setSortValue(value)}
          variant="filter"
        />

        <Button onClick={onFilterClick} variant="btn">
          Filter Directory
        </Button>
      </div>
    </div>
  );
}
