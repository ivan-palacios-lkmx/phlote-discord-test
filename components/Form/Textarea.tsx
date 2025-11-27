import { TextareaHTMLAttributes, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  onWatch?: (formValue: Record<string, unknown>) => void;
}

export function Textarea({ name, onWatch, ...props }: TextareaProps) {
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
      render={({ field }) => <textarea {...props} {...field} />}
    />
  );
}
