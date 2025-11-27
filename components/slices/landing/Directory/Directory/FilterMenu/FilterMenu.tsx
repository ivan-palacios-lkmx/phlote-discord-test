"use client";

import CloseIcon from "@/components/icons/Close";
import { useEffect, useRef } from "react";

import "./FilterMenu.scss";

interface FilterMenuProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  inverse?: boolean;
}

export default function FilterMenu({
  title,
  isOpen,
  onClose,
  children,
  inverse = false,
}: FilterMenuProps) {
  const filtersRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`filter-menu fade-enter-active ${inverse ? "inverse" : ""}`}>
      {/* Filter container with float transition */}
      <div ref={filtersRef} className="filters float-enter-active" data-lenis-prevent>
        {/* Title */}
        <div className="title">
          <h6>{title}</h6>
          <button onClick={onClose} type="button">
            <CloseIcon className="svg-close" />
          </button>
        </div>

        {/* Filter categories slot */}
        {children}
      </div>
    </div>
  );
}
