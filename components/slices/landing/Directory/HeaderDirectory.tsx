"use client";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useRef } from "react";

import FilterButton from "./FilterButton";

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
      className="header sticky top-0 z-10 border-b border-black/30 py-2 flex justify-between items-center"
      ref={headerRef}>
      <div className="active-filters flex items-center gap-2 overflow-hidden flex-1">
        <h6 className="font-condensed text-lg font-semibold whitespace-nowrap m-0">
          ({totalResults}) PEOPLE
        </h6>

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
        <span className="hidden md:block text-[11px] font-mono whitespace-nowrap">SORT BY</span>

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
