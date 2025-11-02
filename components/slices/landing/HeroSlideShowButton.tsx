"use client";

import Button from "@/components/ui/Button";
import { HeroSlideShowSlide } from "@/types/client";
import { quickHash } from "@/utils/functions";
import { PrismicNextImage } from "@prismicio/next";

import HeroTrackPreview from "./HeroTrackPreview";

interface HeroSlideShowButtonProps {
  slide: HeroSlideShowSlide;
  active: boolean;
  progress?: number;
  onClick?: () => void;
  onSeek?: (seekTo: number) => void;
}

export default function HeroSlideShowButton({
  slide,
  active,
  onClick,
  onSeek,
}: HeroSlideShowButtonProps) {
  const hash = slide.title ? quickHash(slide.title) : undefined;

  return (
    <Button onClick={onClick} variant="player">
      {slide.image && (
        <div className="relative h-12 w-32 before:absolute before:inset-0 before:bg-black/50 before:z-10">
          <PrismicNextImage field={slide.image} className="h-12 w-32 object-cover" fallbackAlt="" />
          {active && (
            <span className="absolute inset-0 flex items-center justify-center font-condensed font-semibold text-[11px] uppercase z-20">
              Playing
            </span>
          )}
        </div>
      )}
      <div className="text-left uppercase">
        {slide.title_eyebrow && <span className="text-[8px] font-mono">{slide.title_eyebrow}</span>}
        {slide.title && <h6 className="text-[15px] font-condensed mt-1.5 mb-0 ">{slide.title}</h6>}
      </div>
      <HeroTrackPreview hash={hash} onSeek={onSeek} />
    </Button>
  );
}
