"use client";

import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";

import "./Web3Username.scss";

interface Web3UsernameProps {
  address: string;
  className?: string;
}

export default function Web3Username({ address, className = "" }: Web3UsernameProps) {
  const { addressDoc } = useSyncUser();
  const username = addressDoc?.username || address;

  return (
    <div className={`web3-username ${className}`.trim()}>
      <span>{username || address}</span>
    </div>
  );
}
