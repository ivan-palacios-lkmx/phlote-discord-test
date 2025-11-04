import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  selectOptions: SelectOption[];
  className?: string;
  variant?: "base" | "filter";
  active?: boolean;
  address?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function Select({
  selectOptions,
  variant = "base",
  className,
  active,
  address,
  value,
  onChange,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = selectOptions.find((opt) => opt.value === value) || selectOptions[0];

  const selectVariants = tv({
    base: "border",
    variants: {
      variant: {
        base: "border",
        filter:
          "inline-flex items-center gap-1.5 text-xs font-mono font-normal leading-none uppercase no-underline cursor-pointer bg-black border border-white/50 rounded-[7px] py-[0.4em] px-3 whitespace-nowrap transition-colors duration-300 ease-in-out hover:bg-white hover:text-black disabled:opacity-25 disabled:pointer-events-none",
      },
    },
  });

  const conditionalClasses = [
    variant === "filter" && address ? "p-0" : "",
    variant === "filter" && active ? "bg-white text-black" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleOptionClick = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(selectVariants({ variant }), conditionalClasses, className)}
        {...props}>
        {selectedOption.label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-black border border-white/50 rounded-[7px] overflow-hidden z-50">
          {selectOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full text-left px-3 py-2 text-xs font-mono uppercase text-white hover:bg-white hover:text-black transition-colors ${
                option.value === value ? "bg-white/10" : ""
              }`}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
