"use client";

import "./SortMenu.scss";

interface SortMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function SortMenu({ value, onChange, options }: SortMenuProps) {
  return (
    <div className="sort-menu">
      {/* TODO: Implement sort menu */}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
