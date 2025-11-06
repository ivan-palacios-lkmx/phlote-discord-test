"use client";

import { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  className?: string;
}

export default function Tooltip({ children, className = "" }: TooltipProps) {
  return (
    <div
      className={`absolute z-10 bg-black/90 text-white text-xs rounded px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1 ${className}`}
      style={{ bottom: "100%", left: "50%", transform: "translateX(-50%)" }}>
      {children}
    </div>
  );
}
