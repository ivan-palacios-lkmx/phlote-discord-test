"use client";

import AvatarStack from "@/components/AvatarStack/AvatarStack";
import { usePrismicio } from "@/components/PrismicioProvider";
import MatchIcon from "@/components/match-icon/MatchIcon";
import TrackPreview from "@/components/slices/landing/StemsPlayer/TrackPreview";
import SvgIconCreator from "@/components/svg/creator.svg";
import SvgIconDownload from "@/components/svg/download.svg";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import PauseIcon from "@/components/svg/pause.svg";
import PlayIcon from "@/components/svg/play.svg";
import SvgIconStem from "@/components/svg/stem.svg";
import SvgIconVersion from "@/components/svg/version.svg";
import { useClientDoc } from "@/hooks/useClientDoc";
import { useFirstVersion } from "@/hooks/sessions/useFirstVersion";
import { useWeb3Identity } from "@/hooks/useWeb3Identity";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { startCase } from "lodash";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import "./SessionPreviewBlock.scss";

// Hook for audio playback
function useAudio(versionID: string | null | undefined) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!versionID || !audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [versionID]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const seek = (percentage: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  return { loading, playing, progress, togglePlay, seek, audioRef };
}

// Smart truncate function
function smartTruncate(str: string, maxLength: number, options?: { position?: number }): string {
  if (str.length <= maxLength) return str;
  const position = options?.position || Math.floor(maxLength / 2);
  return (
    str.substring(0, position) + "..." + str.substring(str.length - (maxLength - position - 3))
  );
}

interface SessionPreviewBlockProps {
  name: string;
  objectID: string;
  creator: string;
  collaborators?: string[];
  versionCount?: number;
  downloadCount?: number;
}

export default function SessionPreviewBlock({
  name,
  objectID,
  creator,
  collaborators = [],
  versionCount = 0,
  downloadCount = 0,
}: SessionPreviewBlockProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [ready, setReady] = useState(false);

  const { settings } = usePrismicio();
  const { avatar } = useWeb3Identity(creator);
  const firstVersion = useFirstVersion(objectID);
  const { loading, playing, progress, togglePlay, seek, audioRef } = useAudio(firstVersion?.id);

  const sessionImage = avatar || settings?.default_user_image?.url || "";
  const bounceHash = firstVersion?.bounce as string | undefined;
  const stemCount = firstVersion?.stems?.length || 0;

  // Get audio document from bounce hash
  const audioDocRef = useMemo(() => {
    return bounceHash ? doc(db, `audio/${bounceHash}`) : null;
  }, [bounceHash]);
  const audioDoc = useClientDoc(audioDocRef);
  const audioUrl = (audioDoc?.url as string | undefined) || "";
  const waveTraceSvg = (audioDoc?.waveTrace as string | undefined) || bounceHash || "";

  // Get element height
  useEffect(() => {
    if (!elRef.current) return;
    const updateHeight = () => {
      if (elRef.current) {
        setHeight(elRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Set ready when bounceHash is available
  useEffect(() => {
    if (bounceHash) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [bounceHash]);

  const trimmedName = useMemo(() => smartTruncate(name, 45, { position: 20 }), [name]);
  const hasLongName = useMemo(() => trimmedName.length > 30, [trimmedName]);

  const otherTags = useMemo(() => {
    const versionTags = (firstVersion?.tags || [])
      .filter((t: string) => !t.includes("needs:"))
      .map((t: string) => String(t).split(":")[1]);
    const bpm = firstVersion?.bpm ? `${firstVersion.bpm}BPM` : "";
    return [bpm, ...versionTags].filter(Boolean);
  }, [firstVersion]);

  const needsTags = useMemo(() => {
    return (firstVersion?.tags || [])
      .filter((t: string) => t.includes("needs:"))
      .map((t: string) => {
        const parts = String(t).split(":");
        return startCase(parts[parts.length - 1] || "");
      });
  }, [firstVersion]);

  const classes = useMemo(() => {
    return [
      "session-preview-block",
      hasLongName ? "long-name" : "",
      playing ? "playing" : "",
      ready ? "ready" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [hasLongName, playing, ready]);

  const elStyle = useMemo(() => {
    return {
      "--progress": `${(1 - progress) * 100}%`,
    } as React.CSSProperties & { "--progress": string };
  }, [progress]);

  const imageAreaStyle = useMemo(() => {
    return {
      backgroundImage: `url(${sessionImage})`,
    };
  }, [sessionImage]);

  return (
    <div ref={elRef} className={classes} style={elStyle} onClick={togglePlay}>
      {/* Image */}
      <div className="image-area" style={{ width: height ? `${height}px` : "auto" }}>
        <div className="image" style={imageAreaStyle} />

        <button>{loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}</button>

        <div className="mobile-only">
          <AvatarStack addresses={collaborators} />
        </div>
      </div>

      {/* Metadata */}
      <div className="metadata-area">
        <div className="preview-title">
          <h3 className="session-name">{trimmedName}</h3>
        </div>

        <ul className="preview-tags ul-reset">
          {otherTags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>

        <div className="preview-attributes">
          <div className="attribute-wrap">
            <span>
              <SvgIconDownload />
              <span>{downloadCount}</span>
              <span>Downloads</span>
            </span>
            <span>
              <SvgIconCreator />
              <span>{collaborators?.length || 0}</span>
              <span>Collaborators</span>
            </span>
            <span>
              <SvgIconStem />
              <span>{stemCount}</span>
              <span>Stems</span>
            </span>
            <span>
              <SvgIconVersion />
              <span>{versionCount}</span>
              <span>Versions</span>
            </span>

            <div className="collaborators desktop-only">
              <AvatarStack addresses={collaborators} />
            </div>
          </div>
        </div>

        {waveTraceSvg && (
          <div onClick={(e) => e.stopPropagation()}>
            <TrackPreview
              svg={waveTraceSvg}
              className={`preview-waveform ${playing ? "active" : ""}`}
              onSeek={seek}
            />
          </div>
        )}

        <ul className="preview-needs-tags ul-reset">
          {needsTags.map((tag: string, index: number) => (
            <li key={index}>
              <MatchIcon text={tag} />
            </li>
          ))}
        </ul>
      </div>

      {/* Join */}
      <div className="join-area desktop-only" onClick={(e) => e.stopPropagation()}>
        <Link href={`/sessions/${objectID}`} className="join inverse">
          Join Session
        </Link>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="none" style={{ display: "none" }} />
      )}
    </div>
  );
}
