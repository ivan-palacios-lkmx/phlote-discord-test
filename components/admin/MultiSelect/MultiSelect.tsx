"use client";

import { useMemo } from "react";
import Select, { MultiValue } from "react-select";

import "./MultiSelect.scss";

interface MultiSelectProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  closeOnSelect?: boolean;
}

export default function MultiSelect({
  value,
  options,
  onChange,
  closeOnSelect = false,
}: MultiSelectProps) {
  const selectOptions = useMemo(
    () => options.map((opt) => ({ value: opt, label: opt })),
    [options],
  );

  const selectedOptions = useMemo(
    () => selectOptions.filter((opt) => value.includes(opt.value)),
    [selectOptions, value],
  );

  const handleChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    onChange(newValue.map((opt) => opt.value));
  };

  return (
    <Select
      isMulti
      options={selectOptions}
      value={selectedOptions}
      onChange={handleChange}
      closeMenuOnSelect={closeOnSelect}
      isSearchable={false}
      isClearable={false}
      className="multiselect"
      classNamePrefix="multiselect"
    />
  );
}
