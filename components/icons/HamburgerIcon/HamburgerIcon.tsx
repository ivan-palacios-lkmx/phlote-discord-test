"use client";

import { useState } from "react";

import "./HamburgerIcon.scss";

interface HamburgerIconProps {
  active?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function HamburgerIcon({ active: activeProp, onToggle }: HamburgerIconProps) {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);

  const menuOpen = activeProp !== undefined ? activeProp : internalMenuOpen;

  const toggleMenu = () => {
    const newValue = !menuOpen;
    if (activeProp === undefined) {
      setInternalMenuOpen(newValue);
    }
    onToggle?.(newValue);
  };

  return (
    <button className="site-hamburger" onClick={toggleMenu}>
      <div className="menu-wrapper">
        <div className={`hamburger-menu ${menuOpen ? "active" : ""}`}></div>
      </div>
    </button>
  );
}
