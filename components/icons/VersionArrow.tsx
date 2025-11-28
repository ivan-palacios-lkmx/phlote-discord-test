const VersionArrow = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width="10"
      height="4"
      viewBox="0 0 10 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.58579 0.23338L9.17678 1.82437C9.27441 1.922 9.27441 2.08029 9.17678 2.17792L7.58579 3.76891C7.48816 3.86654 7.32986 3.86654 7.23223 3.76891C7.1346 3.67128 7.1346 3.51299 7.23223 3.41536L8.39645 2.25115H1.25H0.75V1.75115H8.39645L7.23223 0.586933C7.1346 0.489302 7.1346 0.331011 7.23223 0.23338C7.32986 0.135748 7.48816 0.135748 7.58579 0.23338Z"
        fill="white"
      />
    </svg>
  );
};

export default VersionArrow;
