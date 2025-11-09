"use client";

import "./FilterCategoryGroup.scss";

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
  selectedValues,
  onToggle,
}: FilterCategoryGroupProps) {
  return (
    <div className="filter-category-group">
      <h6>{name}</h6>
      <div className="categories">
        {/* TODO: Implement filter category buttons */}
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`filter-category-button ${selectedValues.includes(option) ? "active" : ""}`}
            onClick={() => onToggle(slug, option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
