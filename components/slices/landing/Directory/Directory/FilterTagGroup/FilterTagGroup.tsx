"use client";

import FilterTagRow from "@/components/slices/landing/Directory/Directory/FilterTagRow/FilterTagRow";

import "./FilterTagGroup.scss";

interface FilterTagGroupProps {
  name: string;
  options: string[];
  selectedValues: string[];
  onToggle: (slug: string, value: string) => void;
}

export default function FilterTagGroup({
  name,
  options,
  selectedValues,
  onToggle,
}: FilterTagGroupProps) {
  return (
    <div className="filter-tag-group">
      <h6>{name}</h6>
      <div className="tags">
        {options.map((option) => (
          <FilterTagRow key={option} category={name} value={option} />
        ))}
      </div>
    </div>
  );
}
