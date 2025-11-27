"use client";

import Arrow from "@/components/icons/Arrow";
import LoadingSpinner from "@/components/svg/loading_spinner.svg";
import React from "react";

import "./VersionFormButton.scss";

interface VersionFormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function VersionFormButton({
  loading = false,
  disabled,
  className,
  children,
  ...props
}: VersionFormButtonProps) {
  return (
    <button
      className={`version-form-button inverse ${loading ? "loading" : ""} ${className || ""}`}
      disabled={disabled}
      {...props}>
      <span>{children}</span>

      {loading ? <LoadingSpinner /> : <Arrow />}
    </button>
  );
}
