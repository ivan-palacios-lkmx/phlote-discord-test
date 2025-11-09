"use client";

import PrismicImage from "@/components/Prismic/PrismicImage/PrismicImage";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import Web3Avatar from "@/components/slices/landing/StemsPlayer/Web3Avatar/Web3Avatar";
import type { ReleaseCarouselItem } from "@/types/client";
import { asText } from "@prismicio/client";
import { useEffect, useMemo, useRef, useState } from "react";

import "./ReleaseBlock.scss";

// AvatarStack Component
function AvatarStack({ addresses }: { addresses: string[] }) {
  return (
    <div className="avatar-stack">
      {addresses.slice(0, 3).map((address, index) => (
        <Web3Avatar key={index} address={address} className="avatar-img" />
      ))}
      {addresses.length > 3 && (
        <div className="avatar-img avatar-count">+{addresses.length - 3}</div>
      )}
    </div>
  );
}

// PublicTrackPreview Component
function PublicTrackPreview({ style }: { style: React.CSSProperties & { "--progress"?: string } }) {
  const progress = parseFloat(style["--progress"] || "0");
  const width = `${(1 - progress / 100) * 100}%`;

  return (
    <div className="public-track-preview" style={style}>
      <div className="track-preview-bar">
        <div className="track-preview-progress" style={{ width }} />
      </div>
    </div>
  );
}

// SVG Icons
const SvgPlay = () => (
  <svg className="svg-play" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const SvgPause = () => (
  <svg className="svg-pause" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

interface ReleaseBlockProps {
  release: ReleaseCarouselItem;
}

export default function ReleaseBlock({ release }: ReleaseBlockProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Extract audio URL
  const audioUrl = useMemo(() => {
    if (!release.audio) return "";
    if (typeof release.audio === "object" && "url" in release.audio) {
      return release.audio.url || "";
    }
    return "";
  }, [release.audio]);

  // Extract video URL
  const videoURL = useMemo(() => {
    if (!release.video) return "";
    if (typeof release.video === "object" && "url" in release.video) {
      return release.video.url || "";
    }
    return "";
  }, [release.video]);

  // Extract creators from RichTextField
  const creators = useMemo(() => {
    if (!release.creators) return [];
    if (Array.isArray(release.creators)) {
      return release.creators as string[];
    }
    // If it's a RichTextField, extract text
    try {
      const text = asText(release.creators as never) as string;
      if (typeof text === "string") {
        return text
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }, [release.creators]);

  const hasReleaseData = audioUrl || creators.length > 0;

  // Audio controls
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;
  const playerStyles = {
    "--progress": `${(1 - progress) * 100}%`,
  } as React.CSSProperties & { "--progress": string };

  const ctaUrl = useMemo(() => {
    if (!release.cta_link) return "#";
    if (typeof release.cta_link === "object" && "url" in release.cta_link) {
      return release.cta_link.url || "#";
    }
    return "#";
  }, [release.cta_link]);

  return (
    <div ref={containerRef} className={`release-block ${isIntersected ? "visible" : ""}`}>
      {/* Image */}
      <div className="image-wrap">
        {release.image && <PrismicImage field={release.image} videoSrc={videoURL} />}

        {hasReleaseData && (
          <>
            <div className="gradient-overlay" />

            <div className="release-data">
              {creators.length > 0 && (
                <div className="avatar-area">
                  <AvatarStack addresses={creators} />
                  <div className="creator-count">{creators.length} Collaborators</div>
                </div>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <div className="release-audio-player">
                  <audio ref={audioRef} src={audioUrl} />
                  <button className="play-pause" onClick={togglePlayPause}>
                    {playing ? <SvgPause /> : <SvgPlay />}
                  </button>
                  <PublicTrackPreview style={playerStyles} />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {release.title_eyebrow && <h6>{release.title_eyebrow}</h6>}
      {release.title && <h3>{release.title}</h3>}
      {release.description && <p>{release.description}</p>}

      {release.cta_link && release.cta_text && (
        <ADiv href={ctaUrl} className="a-div mono">
          {release.cta_text}
        </ADiv>
      )}
    </div>
  );
}
