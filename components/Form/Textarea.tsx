import { TextareaHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
}

export function Textarea({ name, ...props }: TextareaProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <textarea {...props} {...field} />}
    />
  );
}
