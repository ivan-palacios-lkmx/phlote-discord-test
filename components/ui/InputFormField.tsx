import type { InputHTMLAttributes } from "react";

import Input from "./Input";

interface InputFormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "variant"> {
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  variant?: "primary" | "secondary" | "outline" | "signature" | "form";
}

export default function InputFormField({
  label,
  labelClassName = "",
  containerClassName = "",
  variant = "form",
  ...inputProps
}: InputFormFieldProps) {
  return (
    <label className={containerClassName}>
      <span className={`block text-[18px] leading-none font-semibold uppercase ${labelClassName}`}>
        {label}
      </span>
      <Input variant={variant} {...inputProps} />
    </label>
  );
}
