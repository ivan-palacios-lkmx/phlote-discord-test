"use client";

import { useEffect, useRef, useState } from "react";

import "./ContactInput.scss";

interface ContactInputProps {
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}

export default function ContactInput({
  value,
  placeholder = "None",
  onChange,
  children,
}: ContactInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const onEdit = async () => {
    setDisabled(false);
    await new Promise((res) => setTimeout(res, 100));
    inputRef.current?.focus();
    setIsEditing(true);
  };

  const onSave = async () => {
    elRef.current?.closest("form")?.requestSubmit();
    await new Promise((res) => setTimeout(res, 100));
    setDisabled(true);
    setIsEditing(false);
  };

  // Handle click outside to disable input
  useEffect(() => {
    if (!elRef.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (elRef.current && !elRef.current.contains(event.target as Node)) {
        setDisabled(true);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="overlay-profile-contact-input" ref={elRef}>
      <label ref={labelRef}>
        {children}
        <input
          ref={inputRef}
          value={value}
          onChange={onInput}
          disabled={disabled}
          type="text"
          placeholder={placeholder}
        />
      </label>
      {isEditing ? (
        <button type="button" className="save" onClick={onSave}>
          Save
        </button>
      ) : (
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      )}
    </div>
  );
}
