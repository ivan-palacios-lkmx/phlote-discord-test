import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface Heading1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "hero" | "default";
}

const heading1Variants = tv({
  base: "uppercase font-bold transition-transform duration-[3000ms] font-condensed",
  variants: {
    variant: {
      hero: "text-[9.375rem] font-bold",
      default: "",
    },
  },
});

export default function Heading1({
  children,
  className,
  variant = "default",
  ...props
}: Heading1Props) {
  return (
    <h1 {...props} className={twMerge(heading1Variants({ variant }), className)}>
      {children}
    </h1>
  );
}
