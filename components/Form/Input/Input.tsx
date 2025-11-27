import { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export function Input({ name, ...props }: InputProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <input {...props} {...field} />}
    />
  );
}
