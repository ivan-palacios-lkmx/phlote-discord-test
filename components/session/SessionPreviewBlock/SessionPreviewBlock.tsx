"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import TrackPreview from "@/components/slices/landing/StemsPlayer/TrackPreview";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import PauseIcon from "@/components/svg/pause.svg";
import PlayIcon from "@/components/svg/play.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useClientDoc } from "@/hooks/useClientDoc";
import { useWeb3Identity } from "@/hooks/useWeb3Identity";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { startCase } from "lodash";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import "./SessionPreviewBlock.scss";

// AvatarStack Component
function AvatarStack({ addresses, className = "" }: { addresses: string[]; className?: string }) {
  return (
    <div className={`avatar-stack ${className}`}>
      {addresses.slice(0, 3).map((address, index) => (
        <Web3Avatar key={index} address={address} className="avatar-img" />
      ))}
      {addresses.length > 3 && (
        <div className="avatar-img avatar-count">+{addresses.length - 3}</div>
      )}
    </div>
  );
}

// SVG Icons
const SvgIconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

const SvgIconCreator = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SvgIconStem = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  </svg>
);

const SvgIconVersion = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

// MatchIcon Component (placeholder)
function MatchIcon({ text }: { text: string }) {
  return <span>{text}</span>;
}

// Hook to get first version
function useFirstVersion(sessionID: string | null | undefined) {
  const [firstVersion, setFirstVersion] = useState<{
    id: string;
    bounce?: string;
    stems?: unknown[];
    tags?: string[];
    bpm?: number;
    [key: string]: unknown;
  } | null>(null);

  useEffect(() => {
    if (!sessionID) {
      setFirstVersion(null);
      return;
    }

    const fetchFirstVersion = async () => {
      try {
        const versionsRef = collection(db, "session-versions");
        const q = query(
          versionsRef,
          where("sessionID", "==", sessionID),
          orderBy("versionIndex", "asc"),
          limit(1),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setFirstVersion({ id: doc.id, ...doc.data() });
        } else {
          setFirstVersion(null);
        }
      } catch (error) {
        console.error("Error fetching first version:", error);
        setFirstVersion(null);
      }
    };

    fetchFirstVersion();
  }, [sessionID]);

  return firstVersion;
}

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

        <AvatarStack addresses={collaborators} className="mobile-only" />
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

            <div className="collaborators">
              <AvatarStack addresses={collaborators} className="desktop-only" />
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
