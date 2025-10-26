"use client";

import { quickHash } from "@/utils/functions";
import { PrismicNextImage } from "@prismicio/next";
import HeroTrackPreview from "./HeroTrackPreview";

// Placeholder components for missing dependencies
const SvgPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

interface SlideData {
  image?: unknown;
  title_eyebrow?: string;
  title?: string;
  video?: {
    url?: string;
  };
}

interface HeroSlideShowButtonProps {
  slide: SlideData;
  active: boolean;
  progress?: number;
  onClick?: () => void;
  onSeek?: (seekTo: number) => void;
}

export default function HeroSlideShowButton({ slide, active, progress, onClick, onSeek }: HeroSlideShowButtonProps) {
  // Generate hash from slide title for track preview
  const hash = slide.title ? quickHash(slide.title) : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "slideshow-button grid gap-2.5 text-white bg-black/30 rounded-[10px] border border-white/20 p-2.5 uppercase transition-all duration-[2000ms] cursor-pointer",
        active ? "bg-black border-black" : "",
        "grid-cols-[100px_150px_300px] md:grid-cols-[100px]"
      ].join(" ")}
    >
      {/* MIGRATED: img-wrap section */}
      <div className="relative pb-[56%]">
        <div className="absolute inset-0 flex items-center justify-center">
          <PrismicNextImage
            field={slide.image as never}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackAlt=""
          />

          <span className="relative z-10">
            {active ? (
              <span className="font-condensed font-semibold text-[11px]">Playing</span>
            ) : (
              <SvgPlay />
            )}
          </span>
        </div>
      </div>

      {/* MIGRATED: desktop-only title section */}
      <div className="hidden md:block text-left">
        {slide.title_eyebrow && (
          <span className="text-[8px] font-mono">{slide.title_eyebrow}</span>
        )}
        {slide.title && (
          <h6 className="text-[15px] font-condensed mt-1.5 mb-0">{slide.title}</h6>
        )}
      </div>

      {/* MIGRATED: desktop-only track preview */}
      <HeroTrackPreview hash={hash} onSeek={onSeek} />
    </button>
  );
}
