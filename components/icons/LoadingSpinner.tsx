const LoadingSpinner = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`loading-spinner ${props.className || ""}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ margin: "auto", display: "block" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid">
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke-width="4"
        stroke="currentColor"
        stroke-dasharray="62 62"
        fill="none"
        stroke-linecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          keyTimes="0;1"
          values="0 50 50;360 50 50"></animateTransform>
      </circle>
    </svg>
  );
};

export default LoadingSpinner;
