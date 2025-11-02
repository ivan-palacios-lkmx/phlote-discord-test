import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "signature" | "blur" | "player";
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
          "mt-10 bg-black border border-[#808080] px-4 py-[0.4em] rounded-full font-mono uppercase inline-flex items-center gap-[5px] transition-colors duration-300 ease-in-out text-white",
        secondary:
          "mt-10 border border-[#808080] px-4 py-[0.4em] rounded-full font-mono uppercase inline-flex items-center gap-[5px] transition-colors duration-300 ease-in-out bg-black text-white hover:bg-white hover:text-black",
        outline:
          "rounded-md  border border-white bg-black px-3 py-1 font-mono uppercase backdrop-blur-md text-white transition-colors hover:bg-white hover:text-black text-[12px]",
        signature:
          "rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-white hover:text-black",
        blur: "mt-5 text-xs font-mono font-normal uppercase text-white border border-white/20 bg-black/20 backdrop-blur-[5px] rounded-[7px] px-4 py-[0.2em] pb-[0.5em] cursor-pointer transition-colors duration-300 hover:bg-white hover:text-black",
        player: "border-black rounded-md flex flex-row bg-black py-3 gap-2 w-full",
      },
    },
  });

  return (
    <button {...props} className={twMerge(buttonVariants({ variant }), className)}>
      {children}
    </button>
  );
}
