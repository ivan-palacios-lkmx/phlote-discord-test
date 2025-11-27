import { InputHTMLAttributes, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import "./Input.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  onWatch?: (formValues: Record<string, unknown>) => void;
}

export function Input({ name, onWatch, ...props }: InputProps) {
  const { control } = useFormContext();

  const value = useWatch({ control, name });

  useEffect(() => {
    if (onWatch) {
      onWatch({ [name]: value });
    }
  }, [value, name, onWatch]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <>
          <input {...props} {...field} />
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
