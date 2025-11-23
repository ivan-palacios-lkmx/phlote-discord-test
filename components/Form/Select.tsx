import { SelectHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
}

export function Select({ name, children, ...props }: SelectProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <select {...props} {...field}>
          {children}
        </select>
      )}
    />
  );
}
