const Version = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-icon-version ${props.className || ""}`}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="3.5"
        y="3"
        width="5"
        height="6"
        rx="0.5"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 1.5H6V2.5H7V1.5C7 0.947715 6.55228 0.5 6 0.5H2C1.44772 0.5 1 0.947715 1 1.5V6.5C1 7.05228 1.44772 7.5 2 7.5H3V6.5H2L2 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Version;
