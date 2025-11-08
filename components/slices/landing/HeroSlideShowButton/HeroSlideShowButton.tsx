"use client";

import HeroTrackPreview from "@/components/slices/landing/HeroTrackPreview";
import Button from "@/components/ui/Button";
import { HeroSlideShowSlide } from "@/types/client";
import { PrismicNextImage } from "@prismicio/next";

interface HeroSlideShowButtonProps {
  slide: HeroSlideShowSlide;
  active: boolean;
  progress?: number;
  onClick?: () => void;
  hash?: string | null;
  waveTrace?: string | null;
}

export default function HeroSlideShowButton({
  slide,
  active,
  onClick,
  hash,
  waveTrace,
}: HeroSlideShowButtonProps) {
  return (
    <Button onClick={onClick} variant="player">
      {slide.image && (
        <div className="relative h-12 w-32 before:absolute before:inset-0 before:bg-black/10 before:z-10">
          <PrismicNextImage
            field={slide.image}
            className="h-12 w-32 object-contain"
            fallbackAlt=""
          />
          {active && (
            <span className="absolute inset-0 flex items-center justify-center font-condensed font-semibold text-[11px] uppercase z-20">
              Playing
            </span>
          )}
        </div>
      )}
      <div className="text-left uppercase flex flex-col">
        {slide.title_eyebrow && (
          <span className="text-[8px] font-mono whitespace-nowrap overflow-hidden truncate">
            {slide.title_eyebrow}
          </span>
        )}
        {slide.title && (
          <h6 className="text-[15px] font-condensed mb-0 whitespace-nowrap overflow-hidden truncate font-bold">
            {slide.title}
          </h6>
        )}
      </div>
      {hash && <HeroTrackPreview hash={hash} waveTrace={waveTrace} />}
    </Button>
  );
}
