import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  selectOptions: SelectOption[];
  className?: string;
  variant?: "base";
}

export default function Select({
  selectOptions,
  variant = "base",
  className,
  ...props
}: SelectProps) {
  const selectVariants = tv({
    base: "border",
    variants: {
      variant: {
        base: "border",
      },
    },
  });

  return (
    <select {...props} className={twMerge(selectVariants({ variant }), className)}>
      {selectOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
