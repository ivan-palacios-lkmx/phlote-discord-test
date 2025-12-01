"use client";

import { useGetAudioWaveTrace } from "@/hooks/query/query-hooks/use-get-audio-wave-trace";
import { useMemo, useState } from "react";

import "./TrackPreview.scss";

interface TrackPreviewProps {
  hash?: string;
  className?: string;
  onSeek?: (percentage: number) => void;
  style?: React.CSSProperties;
}

export default function TrackPreview({ hash, className = "", onSeek, style }: TrackPreviewProps) {
  const [cursorPosition, setCursorPosition] = useState(0);

  const { data: waveTrace } = useGetAudioWaveTrace(hash ?? "", !!hash);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCursorPosition(e.nativeEvent.offsetX);
  };

  const cursorStyle = useMemo(() => {
    return {
      left: `${cursorPosition}px`,
    };
  }, [cursorPosition]);

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const seekTo = e.nativeEvent.offsetX / target.offsetWidth;
    if (onSeek) {
      onSeek(seekTo);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const target = e.currentTarget;
      const seekTo = target.offsetWidth / 2 / target.offsetWidth; // Seek to middle
      if (onSeek) {
        onSeek(seekTo);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`track-preview ${className}`}
      style={style}
      onMouseMove={onMouseMove}
      onClick={onTrackClick}
      onKeyDown={onKeyDown}>
      {waveTrace && <div className="fill" dangerouslySetInnerHTML={{ __html: waveTrace }} />}
      {waveTrace && <div className="outline" dangerouslySetInnerHTML={{ __html: waveTrace }} />}
      <div className="cursor" style={cursorStyle} />
    </div>
  );
}
