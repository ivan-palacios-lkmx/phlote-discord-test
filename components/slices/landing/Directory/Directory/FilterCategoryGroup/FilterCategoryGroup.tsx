"use client";

import FilterCategoryRow from "@/components/slices/landing/Directory/Directory/FilterCategoryRow/FilterCategoryRow";

interface FilterCategoryGroupProps {
  name: string;
  slug: string;
  options: string[];
  selectedValues: string[];
  onToggle: (slug: string, value: string) => void;
}

export default function FilterCategoryGroup({
  name,
  slug,
  options,
  selectedValues: _selectedValues,
  onToggle: _onToggle,
}: FilterCategoryGroupProps) {
  return (
    <div className="filter-category-group">
      <h6>{name}</h6>
      {options.map((value) => (
        <FilterCategoryRow key={value} slug={slug} value={value} />
      ))}
    </div>
  );
}
