import React from "react";

const Close = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      className={`svg-close ${props.className || ""}`}
      width="30"
      height="31"
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M2.05078 2.85205L27.9508 28.7521" stroke="currentColor" stroke-width="3" />
      <path d="M27.9512 2.85205L2.05117 28.7521" stroke="currentColor" stroke-width="3" />
    </svg>
  );
};

export default Close;
