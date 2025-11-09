"use client";

import "./FilterCategoryRow.scss";

interface FilterCategoryRowProps {
  slug: string;
  value: string;
  isSelected?: boolean;
  onToggle?: (slug: string, value: string) => void;
}

export default function FilterCategoryRow({
  slug,
  value,
  isSelected = false,
  onToggle,
}: FilterCategoryRowProps) {
  return (
    <div className="filter-category-row">
      {/* TODO: Implement filter category row */}
      <button
        type="button"
        className={isSelected ? "active" : ""}
        onClick={() => onToggle?.(slug, value)}>
        {value}
      </button>
    </div>
  );
}
