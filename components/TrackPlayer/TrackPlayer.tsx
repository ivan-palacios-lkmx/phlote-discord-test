"use client";

import TrackPreview from "@/components/TrackPreview/TrackPreview";
import { useEffect, useMemo, useRef, useState } from "react";

import "./TrackPlayer.scss";

interface TrackPlayerProps {
  hash?: string;
  url?: string;
}

export default function TrackPlayer({ hash, url }: TrackPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [playing]);

  const progress = useMemo(() => {
    return duration ? currentTime / duration : 0;
  }, [currentTime, duration]);

  const previewStyle = useMemo(() => {
    return {
      "--progress": `${(1 - progress) * 100}%`,
    } as React.CSSProperties & { "--progress": string };
  }, [progress]);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  return (
    <div className="track-player">
      <audio ref={audioRef} src={url} />
      <button onClick={togglePlay} className="play-button" type="button">
        {playing ? "Pause" : "Play"}
      </button>
      <TrackPreview hash={hash} style={previewStyle} />
    </div>
  );
}
