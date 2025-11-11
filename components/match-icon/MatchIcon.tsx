"use client";

import MasterIcon from "@/components/svg/master.svg";
import MixIcon from "@/components/svg/mix_icon.svg";
import ProductionIcon from "@/components/svg/production.svg";
import VocalsIcon from "@/components/svg/vocals.svg";
import { useMemo } from "react";

import "./MatchIcon.scss";

interface MatchIconProps {
  text: string;
}

export default function MatchIcon({ text }: MatchIconProps) {
  const t = useMemo(() => text.toLowerCase(), [text]);

  return (
    <span className="match-icon">
      {t.includes("mix") && <MixIcon />}
      {t.includes("master") && <MasterIcon />}
      {t.includes("vocals") && <VocalsIcon />}
      {t.includes("production") && <ProductionIcon />}
      <span>{text}</span>
    </span>
  );
}
