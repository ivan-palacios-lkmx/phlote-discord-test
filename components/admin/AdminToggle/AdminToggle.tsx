"use client";

import { Controller, useFormContext } from "react-hook-form";

import "./AdminToggle.scss";

interface AdminToggleProps {
  name: string;
  defaultValue: boolean;
}

export default function AdminToggle({ name, defaultValue }: AdminToggleProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <>
          <label className="admin-toggle">
            <input type="checkbox" checked={field.value} onChange={field.onChange} />
            <span className="slider round"></span>
          </label>
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
