import TooltipIcon from "@/components/icons/Tooltip";
import { useRef, useState } from "react";

import "./Tooltip.scss";

interface TooltipProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({ children, className }: TooltipProps) {
  const [focused, setFocused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`tooltip ${className || ""}`}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}>
      <TooltipIcon
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Show tooltip"
      />
      {focused && (
        <div className="content" ref={tooltipRef}>
          {children}
        </div>
      )}
    </div>
  );
}
