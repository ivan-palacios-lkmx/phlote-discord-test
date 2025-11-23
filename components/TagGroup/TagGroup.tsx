"use client";

import CloseIcon from "@/components/svg/close.svg";
import _get from "lodash/get";
import React, { useMemo } from "react";

import "./TagGroup.scss";

interface TagGroupProps {
  name: string;
  values: string[];
  labels?: string[];
  modelValue?: string | string[];
  inputType?: "checkbox" | "radio";
  required?: boolean;
  onChange?: (value: string | string[]) => void;
}

export default function TagGroup({
  name,
  values,
  labels = [],
  modelValue,
  inputType = "checkbox",
  required = false,
  onChange,
}: TagGroupProps) {
  const labelsText = useMemo(() => {
    return values.map((value, i) => _get(labels, `[${i}]`) || value);
  }, [values, labels]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value;

    // Radio
    if (inputType === "radio") {
      onChange?.(targetValue);
    }
    // Checkbox
    else {
      let newValue: string[] = Array.isArray(modelValue) ? [...modelValue] : [];

      if (e.target.checked) {
        newValue.push(targetValue);
      } else {
        newValue = newValue.filter((item) => item !== targetValue);
      }
      onChange?.(newValue);
    }
  };

  const isChecked = (value: string) => {
    if (inputType === "radio") {
      return modelValue === value;
    }
    return Array.isArray(modelValue) && modelValue.includes(value);
  };

  return (
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
  );
}
