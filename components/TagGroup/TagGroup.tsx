"use client";

import CloseIcon from "@/components/icons/Close";
import _get from "lodash/get";
import React, { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import "./TagGroup.scss";

interface TagGroupProps {
  name: string;
  values: string[];
  labels?: string[];
  inputType?: "checkbox" | "radio";
  required?: boolean;
}

export default function TagGroup({
  name,
  values,
  labels = [],
  inputType = "checkbox",
  required = false,
}: TagGroupProps) {
  if (!name) {
    throw new Error("TagGroup requires a 'name' prop");
  }

  const { control, setValue, watch } = useFormContext();
  if (!setValue || !watch) {
    throw new Error("TagGroup must be used within a FormProvider");
  }

  const currentValue = watch(name);
  const labelsText = useMemo(() => {
    return values.map((value, i) => _get(labels, `[${i}]`) || value);
  }, [values, labels]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value;

    if (inputType === "radio") {
      setValue(name, targetValue);
    } else {
      let newValue: string[] = Array.isArray(currentValue) ? [...currentValue] : [];

      if (e.target.checked) {
        newValue.push(targetValue);
      } else {
        newValue = newValue.filter((item) => item !== targetValue);
      }
      setValue(name, newValue);
    }
  };

  const isChecked = (value: string) => {
    if (inputType === "radio") {
      return currentValue === value;
    }
    return Array.isArray(currentValue) && currentValue.includes(value);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <>
          <ul className="tag-group ul-reset">
            {values.map((value, i) => (
              <li key={`${name}-${value}`}>
                <input
                  type={inputType}
                  name={name}
                  value={value}
                  id={`${name}-${value}`}
                  onChange={onInput}
                  required={required}
                  checked={isChecked(value)}
                />
                <label htmlFor={`${name}-${value}`}>
                  <span>{labelsText[i]}</span>
                  <CloseIcon />
                </label>
              </li>
            ))}
          </ul>
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
