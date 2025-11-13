"use client";

import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";

import "./Web3Avatar.scss";

interface Web3AvatarProps {
  address: string;
  className?: string;
}

export default function Web3Avatar({ address, className = "" }: Web3AvatarProps) {
  const { addressDoc } = useSyncUser();
  const avatar = addressDoc?.avatar;

  return (
    <div className={`web3-avatar ${className}`.trim()}>
      {avatar && (
        <div className="fade-enter-active fade-leave-active">
          <img src={avatar} alt="Avatar" />
        </div>
      )}
    </div>
  );
}
