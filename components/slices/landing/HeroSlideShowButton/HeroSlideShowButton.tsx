"use client";

import ProgressiveMedia from "@/components/Prismic/ProgressiveMedia/ProgressiveMedia";
import PlayIcon from "@/components/icons/Play";
import HeroTrackPreview from "@/components/slices/landing/HeroTrackPreview/HeroTrackPreview";
import { HeroSlideShowSlide } from "@/types/client";

import "./HeroSlideShowButton.scss";

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
  progress = 0,
  onClick,
  hash,
  waveTrace,
}: HeroSlideShowButtonProps) {
  return (
    <div className={`slideshow-button ${active ? "active" : ""}`} onClick={onClick}>
      <div className="img-wrap">
        {slide.image && <ProgressiveMedia field={slide.image} />}
        <span>{active ? <span>Playing</span> : <PlayIcon className="svg-play" />}</span>
      </div>
      <div className="title desktop-only">
        {slide.title_eyebrow && <span>{slide.title_eyebrow}</span>}
        {slide.title && <h6>{slide.title}</h6>}
      </div>
      {hash && (
        <div className="track desktop-only">
          <HeroTrackPreview hash={hash} waveTrace={waveTrace} progress={active ? progress : 0} />
        </div>
      )}
    </div>
  );
}
