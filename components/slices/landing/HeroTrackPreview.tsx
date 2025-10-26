"use client";

import { useState, useEffect, useRef } from "react";

interface HeroTrackPreviewProps {
  hash?: string;
  onSeek?: (seekTo: number) => void;
}

export default function HeroTrackPreview({ hash, onSeek }: HeroTrackPreviewProps) {
  const [waveTrace, setWaveTrace] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Placeholder for Firebase integration
  // TODO: Implement Firebase audio document fetching when needed
  useEffect(() => {
    if (hash) {
      // Placeholder: In real implementation, fetch from Firebase
      // const audioDocRef = doc(db, `audio/${hash}`);
      // const audioDoc = await getDoc(audioDocRef);
      // if (audioDoc.exists() && audioDoc.data()?.waveTrace) {
      //   const res = await fetch(audioDoc.data().waveTrace);
      //   setWaveTrace(await res.text());
      // }

      // For now, create a simple placeholder SVG
      setWaveTrace(`
        <svg viewBox="0 0 300 20" xmlns="http://www.w3.org/2000/svg">
          <g class="blobs">
            <rect x="0" y="6" width="4" height="8" fill="currentColor" opacity="0.3"/>
            <rect x="8" y="4" width="4" height="12" fill="currentColor" opacity="0.3"/>
            <rect x="16" y="8" width="4" height="4" fill="currentColor" opacity="0.3"/>
            <rect x="24" y="2" width="4" height="16" fill="currentColor" opacity="0.3"/>
            <rect x="32" y="6" width="4" height="8" fill="currentColor" opacity="0.3"/>
            <rect x="40" y="5" width="4" height="10" fill="currentColor" opacity="0.3"/>
            <rect x="48" y="7" width="4" height="6" fill="currentColor" opacity="0.3"/>
            <rect x="56" y="3" width="4" height="14" fill="currentColor" opacity="0.3"/>
            <rect x="64" y="6" width="4" height="8" fill="currentColor" opacity="0.3"/>
            <rect x="72" y="4" width="4" height="12" fill="currentColor" opacity="0.3"/>
          </g>
        </svg>
      `);
    }
  }, [hash]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      setCursorPosition(offsetX);
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current && onSeek) {
      const seekTo = e.nativeEvent.offsetX / buttonRef.current.offsetWidth;
      onSeek(seekTo);
    }
  };

  const cursorStyle = {
    left: `${cursorPosition}px`,
  };

  return (
    <button
      ref={buttonRef}
      className={[
        "track-preview relative block w-full h-5",
        isHovered ? "hover:cursor-pointer" : ""
      ].join(" ")}
      onMouseMove={handleMouseMove}
      onClick={handleTrackClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* MIGRATED: fill wave trace */}
      {waveTrace && (
        <div
          className="fill absolute inset-0"
          dangerouslySetInnerHTML={{ __html: waveTrace }}
        />
      )}

      {/* MIGRATED: outline wave trace */}
      {waveTrace && (
        <div
          className="outline absolute inset-0"
          dangerouslySetInnerHTML={{ __html: waveTrace }}
        />
      )}

      {/* MIGRATED: cursor */}
      <div
        className={[
          "cursor absolute top-0 w-px h-full bg-white pointer-events-none transition-opacity",
          isHovered ? "opacity-100" : "opacity-0"
        ].join(" ")}
        style={cursorStyle}
      />
    </button>
  );
}
