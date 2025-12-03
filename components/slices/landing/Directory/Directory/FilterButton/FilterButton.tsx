"use client";

import CloseIcon from "@/components/icons/Close";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";

import "./FilterButton.scss";

interface FilterButtonProps {
  address?: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}

export default function FilterButton({
  address,
  className = "",
  onClick,
  children,
}: FilterButtonProps) {
  const isCollaborator = !!address;

  return (
    <button
      className={`filter-button mono ${isCollaborator ? "collaborator" : ""} ${className}`}
      onClick={onClick}
      type="button">
      {address && (
        <>
          <Web3Avatar avatar={address} />
          <Web3Username username={address} />
        </>
      )}

      <span>{children}</span>

      <CloseIcon />
    </button>
  );
}
