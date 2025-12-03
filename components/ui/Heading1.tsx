// Simple utility functions to replace tailwind-merge and tailwind-variants
function twMerge(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

function tv(config: {
  base?: string;
  variants?: { variant?: Record<string, string>; fit?: Record<string, string> };
}) {
  return (options?: { variant?: string; fit?: string }) => {
    const base = config.base || "";
    const variantClass = (options?.variant && config.variants?.variant?.[options.variant]) || "";
    const fitClass = (options?.fit && config.variants?.fit?.[options.fit]) || "";
    return twMerge(base, variantClass, fitClass);
  };
}

interface Heading1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "hero" | "title" | "default";
  fit?: "tight" | "tighter";
}

const heading1Variants = tv({
  base: "uppercase font-bold transition-transform duration-[3000ms] font-condensed",
  variants: {
    variant: {
      hero: "text-[9.375rem] font-bold my-[30px]",
      title: "text-[9.375rem] font-bold",
      default: "",
    },
    fit: {
      tight: "tracking-[-0.04em] leading-none",
      tighter: "tracking-[-0.04em] leading-[0.9]",
    },
  },
});

export default function Heading1({
  children,
  className,
  variant = "default",
  fit = "tight",
  ...props
}: Heading1Props) {
  return (
    <h1 {...props} className={twMerge(heading1Variants({ variant, fit }), className)}>
      {children}
    </h1>
  );
}
