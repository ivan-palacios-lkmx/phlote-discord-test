const Play = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-play ${props.className || ""}`}
      width="17"
      height="19"
      viewBox="-2 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.7498 8.82357C16.2699 9.12382 16.2699 9.87444 15.7498 10.1747L1.70853 18.2814C1.18848 18.5817 0.538417 18.2064 0.538417 17.6059L0.538418 1.39239C0.538418 0.791888 1.18848 0.416574 1.70853 0.716824L15.7498 8.82357Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Play;
