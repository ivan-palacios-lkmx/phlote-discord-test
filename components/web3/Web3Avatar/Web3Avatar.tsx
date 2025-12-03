"use client";

import Image from "next/image";
import { useMemo } from "react";

import "./Web3Avatar.scss";

interface Web3AvatarProps {
  avatar: string;
  className?: string;
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Web3Avatar({ avatar, className = "" }: Web3AvatarProps) {
  const validAvatar = useMemo(() => {
    if (!avatar || typeof avatar !== "string") {
      return null;
    }

    const trimmed = avatar.trim();
    if (!trimmed) {
      return null;
    }

    if (isValidUrl(trimmed)) {
      return trimmed;
    }

    return null;
  }, [avatar]);
  return (
    <div className={`web3-avatar ${className}`.trim()}>
      {validAvatar && (
        <div className="fade-enter-active fade-leave-active">
          <Image src={avatar} alt="Avatar" width={100} height={100} />
        </div>
      )}
    </div>
  );
}
