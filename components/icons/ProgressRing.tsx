const ProgressRing = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-progress-ring ${props.className || ""}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle id="bg" cx="50" cy="50" r="40" strokeWidth="4" />
      <circle id="circle" cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
};

export default ProgressRing;
