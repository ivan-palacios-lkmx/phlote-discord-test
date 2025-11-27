import { InputHTMLAttributes, useEffect, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import "./Input.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  onWatch?: (formValues: Record<string, unknown>) => void;
  defaultValue?: string;
  shouldResetValue?: boolean;
}

export function Input({ name, onWatch, defaultValue, shouldResetValue, ...props }: InputProps) {
  const { control, reset } = useFormContext();

  const value = useWatch({ control, name });
  const onWatchRef = useRef(onWatch);

  useEffect(() => {
    if (onWatchRef.current) {
      onWatchRef.current({ [name]: value });
    }
  }, [value, name]);

  useEffect(() => {
    if (shouldResetValue) {
      reset({ [name]: "" });
    }
  }, [shouldResetValue, name, reset]);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue ?? ""}
      render={({ field, fieldState }) => (
        <>
          <input {...props} {...field} value={field.value ?? ""} />
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
