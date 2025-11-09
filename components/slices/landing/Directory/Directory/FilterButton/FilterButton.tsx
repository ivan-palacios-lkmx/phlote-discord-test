"use client";

import "./FilterButton.scss";

interface FilterButtonProps {
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}

export default function FilterButton({ className = "", onClick, children }: FilterButtonProps) {
  return (
    <button className={`filter-button ${className}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}
