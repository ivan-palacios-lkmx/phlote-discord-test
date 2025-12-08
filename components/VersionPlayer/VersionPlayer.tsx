"use client";

import TrackPreview from "@/components/TrackPreview/TrackPreview";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import PauseIcon from "@/components/icons/Pause";
import PlayIcon from "@/components/icons/Play";
import { useMultiTrackAudio } from "@/hooks/useMultiTrackAudio";
import { VersionDocWithID } from "@/types/database";
import { useMemo, useRef } from "react";

import "./VersionPlayer.scss";

interface VersionPlayerProps {
  versionData: VersionDocWithID;
}

export default function VersionPlayer({ versionData }: VersionPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { loading, playing, currentTrack, progress, togglePlay, switchToTrack, seek } =
    useMultiTrackAudio(versionData?.id, versionData?.sessionID);

  const playerStyle = useMemo(
    () => ({
      "--progress": `${(1 - progress) * 100}%`,
    }),
    [progress],
  ) as React.CSSProperties & { "--progress": string };

  const isSoloed = useMemo(() => currentTrack > 0, [currentTrack]);

  const bounceHash = useMemo(() => versionData?.bounce, [versionData?.bounce]);
  const stems = useMemo(() => versionData?.stems || [], [versionData?.stems]);

  return (
    <div className={`version-player ${isSoloed ? "solo" : ""}`} style={playerStyle}>
      {/* Bounce */}
      <div className="bounce">
        <button className="play-pause" onClick={togglePlay} disabled={loading}>
          {loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        {bounceHash && (
          <TrackPreview
            hash={bounceHash}
            className={`bounce-track ${currentTrack === 0 ? "active" : ""}`}
            onSeek={(s) => seek(s, 0)}
          />
        )}
      </div>
      {/* Stems */}
      <div className="stems desktop-only">
        {stems.map((stem, i) => (
          <button
            key={i}
            onClick={() => switchToTrack(i + 1)}
            className={`stem ${currentTrack === i + 1 ? "active" : ""}`}>
            <div className="solo">
              <div className="circle" />
              <div className="line" />
            </div>

            <div className="track" onClick={(e) => e.stopPropagation()}>
              <h6>{stem.name || ""}</h6>
              {(stem.id || stem.hash) && (
                <TrackPreview hash={stem.id || stem.hash} onSeek={(s) => seek(s, i + 1)} />
              )}
            </div>
          </button>
        ))}
      </div>
      {/* Audio */}
      <audio ref={audioRef} />
    </div>
  );
}
