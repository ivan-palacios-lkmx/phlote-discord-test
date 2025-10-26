import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface Heading4Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "title" | "eyebrow" | "default";
}

const heading4Variants = tv({
  base: "font-condensed uppercase",
  variants: {
    variant: {
      title: "text-[2.25rem] font-bold transition-transform duration-[3000ms]",
      eyebrow: "text-[1.75rem] font-bold transition-transform duration-[3000ms]",
      default: "",
    },
  },
});

export default function Heading4({
  children,
  className,
  variant = "default",
  ...props
}: Heading4Props) {
  return (
    <h4 {...props} className={twMerge(heading4Variants({ variant }), className)}>
      {children}
    </h4>
  );
}
