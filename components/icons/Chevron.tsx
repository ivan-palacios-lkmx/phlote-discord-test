const Chevron = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-chevron ${props.className || ""}`}
      viewBox="0 0 11 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1.5L5.5 6.5L10 1.5" stroke="currentColor" stroke-width="1.5" />
    </svg>
  );
};

export default Chevron;
