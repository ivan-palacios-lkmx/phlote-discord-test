"use client";

import { useWeb3Identity } from "@/hooks/useWeb3Identity";

import "./Web3Username.scss";

interface Web3UsernameProps {
  address: string;
  className?: string;
}

export default function Web3Username({ address, className = "" }: Web3UsernameProps) {
  const { username } = useWeb3Identity(address);

  return (
    <div className={`web3-username ${className}`.trim()}>
      <span>{username || address}</span>
    </div>
  );
}
