import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "signature" | "blur";
}
export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const buttonVariants = tv({
    base: "border",
    variants: {
      variant: {
        primary:
          "pointer-events-auto inline-flex items-center gap-2 rounded-[60px] border px-4 py-2 font-mono uppercase transition-colors bg-white text-black border-gray-400",
        secondary:
          "pointer-events-auto inline-flex items-center gap-2 rounded-[60px] border px-4 py-2 font-mono uppercase transition-colors bg-black text-white border-gray-500",
        outline:
          "rounded-md  border border-white bg-black px-3 py-1 font-mono uppercase backdrop-blur-md text-white transition-colors hover:bg-white hover:text-black text-[12px]",
        signature:
          "rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-white hover:text-black",
        blur: "pointer-events-auto inline-flex items-center gap-2 rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-black/40",
      },
    },
  });

  return (
    <button {...props} className={twMerge(buttonVariants({ variant }), className)}>
      {children}
    </button>
  );
}
