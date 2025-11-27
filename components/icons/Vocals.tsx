import React from "react";

const Vocals = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-vocals ${props.className || ""}`}
      viewBox="0 0 9 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.26876 0C5.46171 0 6.42228 0.873242 6.42228 1.95775V5.50706C6.42228 6.59157 5.46171 7.46481 4.26876 7.46481C3.0758 7.46481 2.11523 6.59157 2.11523 5.50706V1.95775C2.11523 0.873242 3.0758 0 4.26876 0Z"
        fill="currentColor"
      />
      <path
        d="M1.85254 10H6.7793"
        stroke="currentColor"
        stroke-width="0.752891"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.28418 9.88733V8.6479C4.28418 8.6479 7.66164 8.85916 7.66164 6"
        stroke="currentColor"
        stroke-width="0.752891"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.28418 8.6479C4.28418 8.6479 7.66164 8.85916 7.66164 6"
        stroke="currentColor"
        stroke-width="0.752891"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.37746 8.6479C4.37746 8.6479 1 8.85916 1 6"
        stroke="currentColor"
        stroke-width="0.752891"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default Vocals;
