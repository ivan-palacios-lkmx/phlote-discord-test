import { tv } from "tailwind-variants";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "signature";
}
export default function Button({ children, variant = "primary", ...props }: ButtonProps) {
  const buttonVariants = tv({
    base: "border",
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        outline:
          "rounded-md  border border-white bg-black px-3 py-1 font-mono uppercase backdrop-blur-md text-white transition-colors hover:bg-white hover:text-black text-[12px]",
        signature:
          "rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-white hover:text-black",
      },
    },
  });

  return (
    <button {...props} className={buttonVariants({ variant })}>
      {children}
    </button>
  );
}
