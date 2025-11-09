"use client";

import { useWeb3Identity } from "@/hooks/useWeb3Identity";

/**
 * TODO: Review and finalize Web3Avatar component for header
 *
 * This component:
 * 1. Accepts an `address` prop (string)
 * 2. Uses the `useWeb3Identity` hook to get the avatar
 * 3. Displays the avatar image with proper fallback
 *
 * Note: There's already a Web3Avatar in components/slices/landing/StemsPlayer/Web3Avatar/
 * This one is specifically for the header and may need different styling.
 *
 * Example usage:
 * ```tsx
 * <Web3Avatar address="0x123..." />
 * ```
 */

interface Web3AvatarProps {
  address: string;
  className?: string;
}

export default function Web3Avatar({ address, className = "" }: Web3AvatarProps) {
  const { avatar } = useWeb3Identity(address);

  return (
    <div className={`web3-avatar ${className}`.trim()}>
      {avatar && <img src={avatar} alt="Avatar" />}
    </div>
  );
}
