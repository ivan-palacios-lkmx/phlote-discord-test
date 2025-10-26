import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface Heading2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "title" | "default";
}

const heading2Variants = tv({
  base: "font-condensed uppercase",
  variants: {
    variant: {
      title: "text-[2.25rem] font-bold transition-transform duration-[3000ms]",
      default: "",
    },
  },
});

export default function Heading2({
  children,
  className,
  variant = "default",
  ...props
}: Heading2Props) {
  return (
    <h2 {...props} className={twMerge(heading2Variants({ variant }), className)}>
      {children}
    </h2>
  );
}
