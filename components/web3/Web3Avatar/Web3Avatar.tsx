"use client";

import { useWeb3Identity } from "@/hooks/useWeb3Identity";
import Image from "next/image";

import "./Web3Avatar.scss";

interface Web3AvatarProps {
  address: string;
  className?: string;
}

export default function Web3Avatar({ address, className = "" }: Web3AvatarProps) {
  const { avatar } = useWeb3Identity(address);

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
