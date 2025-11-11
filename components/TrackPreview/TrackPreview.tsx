"use client";

import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import "./TrackPreview.scss";

interface TrackPreviewProps {
  hash?: string;
  className?: string;
  onSeek?: (percentage: number) => void;
}

export default function TrackPreview({ hash, className = "", onSeek }: TrackPreviewProps) {
  const [waveTrace, setWaveTrace] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Create audio document reference
  const audioDocRef = useMemo(() => {
    return hash ? doc(db, `audio/${hash}`) : null;
  }, [hash]);

  // Get audio document
  const audioDoc = useClientDoc(audioDocRef);

  // Fetch waveTrace SVG when audioDoc changes
  useEffect(() => {
    if (audioDoc?.waveTrace) {
      const fetchWaveTrace = async () => {
        try {
          const res = await fetch(audioDoc.waveTrace as string);
          const text = await res.text();
          setWaveTrace(text);
        } catch (error) {
          console.error("Error fetching waveTrace:", error);
          setWaveTrace(null);
        }
      };
      fetchWaveTrace();
    } else {
      setWaveTrace(null);
    }
  }, [audioDoc?.waveTrace]);

  // Handle mouse move
  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCursorPosition(e.nativeEvent.offsetX);
  };

  // Cursor style
  const cursorStyle = useMemo(() => {
    return {
      left: `${cursorPosition}px`,
    };
  }, [cursorPosition]);

  // Handle track click
  const onTrackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const seekTo = e.nativeEvent.offsetX / target.offsetWidth;
    if (onSeek) {
      onSeek(seekTo);
    }
  };

  return (
    <button
      className={`track-preview ${className}`}
      onMouseMove={onMouseMove}
      onClick={onTrackClick}>
      {waveTrace && <div className="fill" dangerouslySetInnerHTML={{ __html: waveTrace }} />}
      {waveTrace && <div className="outline" dangerouslySetInnerHTML={{ __html: waveTrace }} />}
      <div className="cursor" style={cursorStyle} />
    </button>
  );
}
