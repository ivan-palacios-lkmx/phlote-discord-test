"use client";

import { useWeb3Identity } from "@/hooks/useWeb3Identity";

/**
 * TODO: Review and finalize Web3Username component implementation
 *
 * This component:
 * 1. Accepts an `address` prop (string)
 * 2. Uses the `useWeb3Identity` hook to get the username
 * 3. Displays the username (ENS, Zora, OpenSea, or short address)
 *
 * Example usage:
 * ```tsx
 * <Web3Username address="0x123..." />
 * ```
 */

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
