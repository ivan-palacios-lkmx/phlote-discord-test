import type { InputHTMLAttributes } from "react";

import Input from "./Input";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "variant"> {
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  variant?: "primary" | "secondary" | "outline" | "signature" | "form";
}

export default function Field({
  label,
  labelClassName = "",
  containerClassName = "",
  variant = "form",
  ...inputProps
}: FieldProps) {
  return (
    <label className={containerClassName}>
      <span className={`block text-[18px] leading-none font-semibold uppercase ${labelClassName}`}>
        {label}
      </span>
      <Input variant={variant} {...inputProps} />
    </label>
  );
}
