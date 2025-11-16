"use client";

import "./Web3Username.scss";

interface Web3UsernameProps {
  username: string;
  className?: string;
}

export default function Web3Username({ username, className = "" }: Web3UsernameProps) {
  return (
    <div className={`web3-username ${className}`.trim()}>
      <span>{username}</span>
    </div>
  );
}
