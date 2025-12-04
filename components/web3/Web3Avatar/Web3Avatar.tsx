"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import "./Web3Avatar.scss";

interface Web3AvatarProps {
  avatar: string;
  className?: string;
  fallback?: string;
}

function isValidAvatarUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  // Accept relative paths starting with /
  if (trimmed.startsWith("/")) {
    return true;
  }

  // Accept full URLs (http/https)
  try {
    const urlObj = new URL(trimmed);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Web3Avatar({
  avatar,
  className = "",
  fallback = "/images/phlote-poster.jpg",
}: Web3AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const validAvatar = useMemo(() => {
    if (!avatar || typeof avatar !== "string") {
      return null;
    }

    const trimmed = avatar.trim();
    if (!trimmed) {
      return null;
    }

    if (isValidAvatarUrl(trimmed)) {
      return trimmed;
    }

    return null;
  }, [avatar]);

  const imageSrc = hasError || !validAvatar ? fallback : validAvatar;

  if (!avatar) {
    return null;
  }

  return (
    <div className={`web3-avatar ${className}`.trim()}>
      <div className="fade-enter-active fade-leave-active">
        <Image
          src={imageSrc}
          alt="Avatar"
          width={100}
          height={100}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
