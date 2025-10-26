import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

interface Heading3Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

const heading3Variants = tv({
  base: '',
});

export default function Heading3({ children, className, ...props }: Heading3Props) {
  return (
    <h3 {...props} className={twMerge(heading3Variants(), className)}>
      {children}
    </h3>
  );
}
