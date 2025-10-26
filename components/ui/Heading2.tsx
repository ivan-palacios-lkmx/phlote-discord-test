import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

interface Heading2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

const heading2Variants = tv({
  base: '',
});

export default function Heading2({ children, className, ...props }: Heading2Props) {
  return (
    <h2 {...props} className={twMerge(heading2Variants(), className)}>
      {children}
    </h2>
  );
}
