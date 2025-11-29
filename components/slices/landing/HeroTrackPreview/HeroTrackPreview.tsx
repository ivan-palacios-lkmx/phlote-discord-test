"use client";

import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import "./HeroTrackPreview.scss";

interface HeroTrackPreviewProps {
  hash?: string | null;
  waveTrace?: string | null;
  onSeek?: (seekTo: number) => void;
  progress?: number;
}

export default function HeroTrackPreview({
  hash,
  waveTrace: propWaveTrace,
  onSeek,
  progress = 0,
}: HeroTrackPreviewProps) {
  const [waveTrace, setWaveTrace] = useState<string | null>(propWaveTrace || null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const audioDocRef = useMemo(() => {
    return hash ? doc(db, `audio/${hash}`) : null;
  }, [hash]);

  const audioDoc = useClientDoc(audioDocRef);

  // Fetch waveTrace when audioDoc changes
  useEffect(() => {
    if (audioDoc?.waveTrace && typeof audioDoc.waveTrace === "string") {
      fetch(audioDoc.waveTrace)
        .then((res) => res.text())
        .then((text) => setWaveTrace(text))
        .catch((error) => {
          console.error("Error fetching waveTrace:", error);
        });
    }
  }, [audioDoc]);

  // Use prop waveTrace if provided
  useEffect(() => {
    if (propWaveTrace) {
      setWaveTrace(propWaveTrace);
    }
  }, [propWaveTrace]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    setCursorPosition(offsetX);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const seekTo = e.nativeEvent.offsetX / e.currentTarget.offsetWidth;
    onSeek?.(seekTo);
  };

  const cursorStyle = useMemo(() => {
    return {
      left: `${cursorPosition}px`,
    };
  }, [cursorPosition]);

  const trackStyle = useMemo(() => {
    return {
      "--progress": `${(1 - progress) * 100}%`,
    } as React.CSSProperties & { "--progress": string };
  }, [progress]);

  if (!waveTrace) return null;

  return (
    <button
      className="track-preview"
      style={trackStyle}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      type="button">
      <div className="fill" dangerouslySetInnerHTML={{ __html: waveTrace }} />
      <div className="outline" dangerouslySetInnerHTML={{ __html: waveTrace }} />
      <div className="cursor" style={cursorStyle} />
    </button>
  );
}
