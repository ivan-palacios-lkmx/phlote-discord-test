"use client";

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
        {/* TODO: Implement filter tag buttons */}
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`filter-tag-button ${selectedValues.includes(option) ? "active" : ""}`}
            onClick={() => onToggle("tags", option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
