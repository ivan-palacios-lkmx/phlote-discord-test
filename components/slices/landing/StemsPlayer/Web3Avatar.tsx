"use client";

import { useWeb3Identity } from "@/hooks/useWeb3Identity";
import Image from "next/image";

interface Web3AvatarProps {
  address: string;
  className?: string;
}

export default function Web3Avatar({ address, className = "" }: Web3AvatarProps) {
  const { avatar } = useWeb3Identity(address);

  return (
    <div className={`web3-avatar overflow-hidden relative ${className}`}>
      {avatar && (
        <div className="transition-opacity duration-300 opacity-100">
          <Image src={avatar} alt="Avatar" fill className="object-cover" />
        </div>
      )}
    </div>
  );
}
