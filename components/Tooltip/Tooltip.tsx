import TooltipIcon from "@/components/svg/tooltip.svg";
import { useRef, useState } from "react";

import "./Tooltip.scss";

interface TooltipProps {
  children: React.ReactNode;
}

export default function Tooltip({ children }: TooltipProps) {
  const [focused, setFocused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // TODO: Add floating UI with ref for focus
  return (
    <div className="tooltip">
      <TooltipIcon />
      {focused && (
        <div className="content" ref={tooltipRef}>
          {children}
        </div>
      )}
    </div>
  );
}
