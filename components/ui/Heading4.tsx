import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

interface Heading4Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

const heading4Variants = tv({
  base: 'm-0 text-base md:text-lg font-condensed font-semibold uppercase',
});

export default function Heading4({ children, className, ...props }: Heading4Props) {
  return (
    <h4 {...props} className={twMerge(heading4Variants(), className)}>
      {children}
    </h4>
  );
}
