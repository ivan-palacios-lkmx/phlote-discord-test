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
  // TODO: Add floating UI with ref for focus
  return (
    <div className={`tooltip ${className || ""}`}>
      <TooltipIcon />
      {focused && (
        <div className="content" ref={tooltipRef}>
          {children}
        </div>
      )}
    </div>
  );
}
