"use client";

import "./AdminToggle.scss";

interface AdminToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function AdminToggle({ checked, onChange }: AdminToggleProps) {
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(!!e.target.checked);
  };

  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={handleToggle} />
      <span className="slider round"></span>
    </label>
  );
}
