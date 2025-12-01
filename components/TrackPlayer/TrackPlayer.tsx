"use client";

import TrackPreview from "@/components/TrackPreview/TrackPreview";
import { useMediaControls } from "@/hooks/useMediaControls";
import { useMemo, useRef } from "react";

import "./TrackPlayer.scss";

interface TrackPlayerProps {
  hash?: string;
  url?: string;
}

export default function TrackPlayer({ hash, url }: TrackPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { playing, setPlaying, currentTime, duration } = useMediaControls(audioRef, {
    src: url,
  });

  const progress = useMemo(() => (duration ? currentTime / duration : 0), [currentTime, duration]);

  const previewStyle = useMemo(
    () =>
      ({
        "--progress": `${(1 - progress) * 100}%`,
      }) as React.CSSProperties & { "--progress": string },
    [progress],
  );

  return (
    <div className="track-player">
      <audio ref={audioRef} />
      <button onClick={() => setPlaying(!playing)} className="play-button" type="button">
        {playing ? "Pause" : "Play"}
      </button>
      <TrackPreview hash={hash} style={previewStyle} />
    </div>
  );
}
