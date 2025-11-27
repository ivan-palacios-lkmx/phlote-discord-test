const Download = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-icon-download ${props.className || ""}`}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1844_1256)">
        <path
          d="M8.5 5.89844V8.46987H1.5V5.89844H0.5V8.46987C0.5 8.74266 0.605357 9.00428 0.792893 9.19718C0.98043 9.39007 1.23478 9.49844 1.5 9.49844H8.5C8.76522 9.49844 9.01957 9.39007 9.20711 9.19718C9.39464 9.00428 9.5 8.74266 9.5 8.46987V5.89844H8.5Z"
          fill="currentColor"
        />
        <path
          d="M4.9998 7.7L7.6998 4.61429H5.5398V0.5H4.4598V4.61429H2.2998L4.9998 7.7Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_1844_1256">
          <rect width="9" height="9" fill="white" transform="translate(0.5 0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Download;
