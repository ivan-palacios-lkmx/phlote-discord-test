// Simple utility functions to replace tailwind-merge and tailwind-variants
function twMerge(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

function tv(config: { base?: string; variants?: { variant?: Record<string, string> } }) {
  return (options?: { variant?: string }) => {
    const base = config.base || "";
    const variantClass = options?.variant && config.variants?.variant?.[options.variant] || "";
    return twMerge(base, variantClass);
  };
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "primary" | "secondary" | "outline" | "signature" | "form";
  className?: string;
}

const inputVariants = tv({
  base: "rounded-sm uppercase font-mono text-[12px]",
  variants: {
    variant: {
      primary: "bg-white text-black px-3 py-1 focus:outline-none",
      secondary: "",
      outline: "",
      signature: "",
      form: "block w-full box-border border border-black/20 rounded-[10px] px-5 py-5 uppercase mt-[15px] transition-colors focus:border-black disabled:opacity-50 text-base font-sans bg-white",
    },
  },
});

export default function Input({ variant = "primary", className, ...props }: InputProps) {
  return <input {...props} className={twMerge(inputVariants({ variant }), className)} />;
}
