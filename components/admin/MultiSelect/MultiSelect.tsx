"use client";

import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Select, { MultiValue } from "react-select";

import "./MultiSelect.scss";

interface MultiSelectProps {
  options: string[];
  name: string;
  closeOnSelect?: boolean;
}

export default function MultiSelect({ options, name, closeOnSelect = false }: MultiSelectProps) {
  const { control } = useFormContext();
  const selectOptions = useMemo(
    () => options.map((opt) => ({ value: opt, label: opt })),
    [options],
  );

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field, fieldState }) => (
        <>
          <Select
            isMulti
            options={selectOptions}
            value={(field.value || []).map((opt: string) => ({ value: opt, label: opt }))}
            onChange={(newValue: MultiValue<{ value: string; label: string }>) => {
              field.onChange(newValue ? newValue.map((opt) => opt.value) : []);
            }}
            closeMenuOnSelect={closeOnSelect}
            isSearchable={false}
            isClearable={false}
            className="multiselect"
            classNamePrefix="multiselect"
          />
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
