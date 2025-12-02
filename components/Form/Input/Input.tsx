import { InputHTMLAttributes, useEffect, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import "./Input.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  onWatch?: (formValues: Record<string, unknown>) => void;
  defaultValue?: string;
  resetValue?: string;
}

export function Input({ name, onWatch, defaultValue, resetValue, ...props }: InputProps) {
  const { control, setValue } = useFormContext();

  const value = useWatch({ control, name });
  const onWatchRef = useRef(onWatch);
  const lastResetValueRef = useRef<string | undefined>(undefined);
  const initialDefaultValueRef = useRef(defaultValue ?? "");

  useEffect(() => {
    if (onWatchRef.current) {
      onWatchRef.current({ [name]: value });
    }
  }, [value, name]);

  useEffect(() => {
    if (resetValue !== undefined && resetValue !== lastResetValueRef.current) {
      lastResetValueRef.current = resetValue;
      setValue(name, resetValue, { shouldDirty: false, shouldValidate: false });
    }
  }, [resetValue, name, setValue]);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={initialDefaultValueRef.current}
      render={({ field, fieldState }) => (
        <>
          <input {...props} {...field} value={field.value ?? ""} />
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
