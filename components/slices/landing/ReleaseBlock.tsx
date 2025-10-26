"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import type { ImageField, LinkField } from "@prismicio/client";

// UNKNOWN: AvatarStack component TODO: Add it later
// This is a placeholder component for displaying collaborator avatars
function AvatarStack({ addresses }: { addresses: string[] }) {
  return (
    <div className="avatar-stack flex -space-x-2">
      {addresses.slice(0, 3).map((address, index) => (
        <div
          key={index}
          className="avatar-img h-[45px] w-[45px] rounded-full border-2 border-white bg-gray-600 flex items-center justify-center text-white text-xs font-semibold"
        >
          {address.slice(0, 2).toUpperCase()}
        </div>
      ))}
      {addresses.length > 3 && (
        <div className="avatar-img h-[45px] w-[45px] rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-white text-xs font-semibold">
          +{addresses.length - 3}
        </div>
      )}
    </div>
  );
}

// UNKNOWN: PublicTrackPreview component TODO: Add it later
// This is a placeholder component for audio track visualization
function PublicTrackPreview({ style }: { style: React.CSSProperties & { '--progress'?: string } }) {
  return (
    <div className="public-track-preview h-[60px] bg-gray-800 rounded flex items-center px-4" style={style}>
      <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${(1 - (parseFloat(style['--progress'] || '0'))) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Placeholder SVG components
const SvgPlay = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const SvgPause = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

interface ReleaseData {
  image?: ImageField;
  video?: { url?: string };
  audio?: { url?: string };
  creators?: unknown;
  title_eyebrow?: string;
  title?: string;
  description?: string;
  cta_link?: LinkField;
  cta_text?: string;
}

interface ReleaseBlockProps {
  release: ReleaseData;
}

export default function ReleaseBlock({ release }: ReleaseBlockProps) {
  const [isIntersected, setIsIntersected] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Intersection observer for fade-in animation
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Audio controls
  const audioUrl = release.audio?.url;

  // Parse creators from Prismic rich text
  const creators = (() => {
    if (!release.creators) return [];
    // TODO: Implement proper Prismic rich text parsing
    // For now, return empty array as placeholder
    return [];
  })();

  const hasReleaseData = audioUrl || creators.length > 0;

  // Audio player controls
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const progress = duration > 0 ? currentTime / duration : 0;
  const playerStyles = {
    '--progress': `${(1 - progress) * 100}%`,
  } as React.CSSProperties & { '--progress': string };

  return (
    <div
      ref={containerRef}
      className={[
        "release-block transition-opacity duration-[400ms] ease-in-out transition-transform duration-[1.5s] ease-out",
        isIntersected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[100px]"
      ].join(" ")}
    >
      {/* MIGRATED: Image section */}
      <div className="image-wrap relative">
        <PrismicNextImage
          field={release.image as never}
          className="prismic-image rounded-[10px] overflow-hidden"
          fallbackAlt=""
        />

        {hasReleaseData && (
          <>
            {/* MIGRATED: Gradient overlay */}
            <div className="gradient-overlay absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

            {/* MIGRATED: Release data overlay */}
            <div className="release-data absolute inset-0 flex flex-col justify-end text-white p-[40px] px-[var(--margin)]">
              {/* MIGRATED: Avatar area */}
              {creators.length > 0 && (
                <div className="avatar-area grid grid-cols-[auto_1fr] items-center gap-[10px]">
                  <AvatarStack addresses={creators} />
                  <div className="creator-count text-sm font-medium min-w-0">
                    {creators.length} Collaborators
                  </div>
                </div>
              )}

              {/* MIGRATED: Audio player */}
              {audioUrl && (
                <div className="release-audio-player mt-5 grid grid-cols-[auto_1fr] gap-[10px]">
                  <audio ref={audioRef} src={audioUrl} />
                  <button
                    onClick={togglePlayPause}
                    className="play-pause border border-white w-[60px] h-[60px] bg-black/35 rounded-full text-white flex justify-center items-center hover:bg-black/50 transition-colors"
                  >
                    {playing ? <SvgPause /> : <SvgPlay />}
                  </button>
                  <PublicTrackPreview style={playerStyles} />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MIGRATED: Content section */}
      <h6 className="my-[15px] text-[12px] font-mono uppercase">
        {release.title_eyebrow}
      </h6>
      <h3 className="my-[15px] font-condensed text-xl font-semibold">
        {release.title}
      </h3>
      <p className="text-[12px] max-w-[400px] my-[15px] leading-relaxed">
        {release.description}
      </p>

      {/* MIGRATED: CTA Link */}
      {release.cta_link && release.cta_text && (
        <Link
          href={(release.cta_link as { url?: string })?.url || "#"}
          className="a-div standard-button inline-block cursor-pointer rounded-[60px] border border-white/20 bg-black/20 px-6 py-3 font-mono uppercase backdrop-blur-md transition-colors hover:bg-black/40 md:block md:w-full md:text-center md:p-2"
        >
          {release.cta_text}
        </Link>
      )}
    </div>
  );
}
