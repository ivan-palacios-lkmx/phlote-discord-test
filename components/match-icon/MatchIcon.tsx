"use client";

import MasterIcon from "@/components/icons/Master";
import MixIcon from "@/components/icons/MixIcon";
import ProductionIcon from "@/components/icons/Production";
import VocalsIcon from "@/components/icons/Vocals";
import { useMemo } from "react";

import "./MatchIcon.scss";

interface MatchIconProps {
  text: string;
}

export default function MatchIcon({ text }: MatchIconProps) {
  const lowerText = useMemo(() => text.toLowerCase(), [text]);

  return (
    <span className="match-icon">
      {lowerText.includes("mix") && <MixIcon />}
      {lowerText.includes("master") && <MasterIcon />}
      {lowerText.includes("vocals") && <VocalsIcon />}
      {lowerText.includes("production") && <ProductionIcon />}
      <span>{text}</span>
    </span>
  );
}
