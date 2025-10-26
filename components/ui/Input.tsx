import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "primary" | "secondary" | "outline" | "signature";
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
    },
  },
});

export default function Input({ variant = "primary", className, ...props }: InputProps) {
  return <input {...props} className={twMerge(inputVariants({ variant }), className)} />;
}
