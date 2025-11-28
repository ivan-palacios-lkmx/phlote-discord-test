import { TextareaHTMLAttributes, useEffect, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  onWatch?: (formValue: Record<string, unknown>) => void;
}

export function Textarea({ name, onWatch, ...props }: TextareaProps) {
  const { control } = useFormContext();
  const value = useWatch({ control, name });
  const onWatchRef = useRef(onWatch);

  useEffect(() => {
    if (onWatchRef.current) {
      onWatchRef.current({ [name]: value });
    }
  }, [value, name]);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue=""
      render={({ field }) => <textarea {...props} {...field} value={field.value ?? ""} />}
    />
  );
}
