const Drag = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      className={`svg-drag ${props.className || ""}`}
      {...props}
      width="9"
      height="5"
      viewBox="0 0 9 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M0 1H9M0 4H9" stroke="currentColor" />
    </svg>
  );
};

export default Drag;
