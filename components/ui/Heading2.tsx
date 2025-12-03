// Simple utility functions to replace tailwind-merge and tailwind-variants
function twMerge(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

function tv(config: { base?: string; variants?: { variant?: Record<string, string> } }) {
  return (options?: { variant?: string }) => {
    const base = config.base || "";
    const variantClass = (options?.variant && config.variants?.variant?.[options.variant]) || "";
    return twMerge(base, variantClass);
  };
}

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
