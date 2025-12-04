"use client";

import Check from "@/components/icons/Check";
import Chevron from "@/components/icons/Chevron";
import { memo, useEffect, useRef, useState } from "react";

import "./SortMenu.scss";

interface SortMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const SortMenu = memo(function SortMenu({ value, onChange, options }: SortMenuProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    if (!optionsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOptionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsOpen]);

  const handleInput = (option: string) => {
    onChange(option);
    setOptionsOpen(false);
  };

  return (
    <div className={`sort-menu ${optionsOpen ? "open" : ""}`} ref={containerRef}>
      <button type="button" onClick={() => setOptionsOpen(!optionsOpen)}>
        <span>{value}</span>
        <Chevron />
      </button>

      <div className={`option-wrap ${optionsOpen ? "open" : ""}`}>
        <ul className="ul-reset">
          {options.map((option, i) => (
            <li key={option}>
              <input
                id={`sortOption${i}`}
                type="radio"
                value={option}
                name="sort"
                checked={value === option}
                onChange={() => handleInput(option)}
              />
              <label htmlFor={`sortOption${i}`} className={value === option ? "active" : ""}>
                {/* TODO: Add check icon, when we solve the width and height issues with the icon */}
                <Check />
                <span>{option}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default SortMenu;
