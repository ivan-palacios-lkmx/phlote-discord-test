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

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "form";
  className?: string;
}

const textAreaVariants = tv({
  base: "",
  variants: {
    variant: {
      form: "block w-full box-border border border-black/20 rounded-[10px] px-5 py-5 h-[150px] font-body resize-none uppercase mt-[15px] transition-colors focus:border-black disabled:opacity-50 bg-white",
    },
  },
});

export default function TextArea({ variant = "form", className, ...props }: TextAreaProps) {
  return <textarea {...props} className={twMerge(textAreaVariants({ variant }), className)} />;
}
