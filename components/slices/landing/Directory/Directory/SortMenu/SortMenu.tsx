"use client";

import CheckIcon from "@/components/svg/check.svg";
import ChevronIcon from "@/components/svg/chevron.svg";
import { useEffect, useRef, useState } from "react";

import "./SortMenu.scss";

interface SortMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function SortMenu({ value, onChange, options }: SortMenuProps) {
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
        <ChevronIcon className="svg-chevron" />
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
                <CheckIcon className="svg-check" />
                <span>{option}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
