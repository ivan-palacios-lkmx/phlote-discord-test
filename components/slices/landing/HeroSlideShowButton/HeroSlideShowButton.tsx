"use client";

import HeroTrackPreview from "@/components/slices/landing/HeroTrackPreview";
import PlayIcon from "@/components/svg/play.svg";
import { HeroSlideShowSlide } from "@/types/client";
import { PrismicNextImage } from "@prismicio/next";

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
  onClick,
  hash,
  waveTrace,
}: HeroSlideShowButtonProps) {
  return (
    <div className={`slideshow-button ${active ? "active" : ""}`} onClick={onClick}>
      <div className="img-wrap">
        {slide.image && <PrismicNextImage field={slide.image} fallbackAlt="" />}
        <span>{active ? <span>Playing</span> : <PlayIcon className="svg-play" />}</span>
      </div>
      <div className="title desktop-only">
        {slide.title_eyebrow && <span>{slide.title_eyebrow}</span>}
        {slide.title && <h6>{slide.title}</h6>}
      </div>
      {hash && (
        <div className="track-preview desktop-only">
          <HeroTrackPreview hash={hash} waveTrace={waveTrace} />
        </div>
      )}
    </div>
  );
}
