const Stem = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-icon-stem ${props.className || ""}`}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.5 5L0.5 5M7.92871 7.5L2.07157 7.5M7.92871 2.5L2.07157 2.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
};

export default Stem;
