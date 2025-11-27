const Production = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      className={`svg-icon-production ${props.className || ""}`}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.94353 5.29903V2.57367L3.67755 3.94264V8.32856C3.67755 10.344 0 10.6608 0 8.59477C0 7.37788 1.48445 6.63005 2.62109 6.9849V2.10463C2.62109 2.01589 2.6746 1.92715 2.78154 1.88914L8.67904 0.0131838C8.75926 -0.0121409 8.83949 0.000486832 8.89298 0.0385085C8.95981 0.0892258 9 0.152571 9 0.228622V6.62998C9 8.6581 5.32245 8.96225 5.32245 6.8962C5.32245 5.67931 6.8069 4.93148 7.94353 5.29903Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Production;
