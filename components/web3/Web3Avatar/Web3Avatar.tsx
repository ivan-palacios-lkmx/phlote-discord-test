"use client";

import Image from "next/image";

import "./Web3Avatar.scss";

interface Web3AvatarProps {
  avatar: string;
  className?: string;
}

export default function Web3Avatar({ avatar, className = "" }: Web3AvatarProps) {
  return (
    <div className={`web3-avatar ${className}`.trim()}>
      {avatar && (
        <div className="fade-enter-active fade-leave-active">
          <Image src={avatar} alt="Avatar" width={100} height={100} />
        </div>
      )}
    </div>
  );
}
