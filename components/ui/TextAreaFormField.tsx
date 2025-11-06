import type { TextareaHTMLAttributes } from "react";

import TextArea from "./TextArea";

interface TextAreaFormFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "variant"> {
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  variant?: "form";
}

export default function TextAreaFormField({
  label,
  labelClassName = "",
  containerClassName = "",
  variant = "form",
  ...textAreaProps
}: TextAreaFormFieldProps) {
  return (
    <label className={containerClassName}>
      <span className={`block text-[18px] leading-none font-semibold uppercase ${labelClassName}`}>
        {label}
      </span>
      <TextArea variant={variant} {...textAreaProps} />
    </label>
  );
}
