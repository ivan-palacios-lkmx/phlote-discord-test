"use client";

import HeroSlideShowButton from "@/components/slices/landing/HeroSlideShowButton";
import Button from "@/components/ui/Button";
import Heading1 from "@/components/ui/Heading1";
import Heading4 from "@/components/ui/Heading4";
import { useHeroSlideShow } from "@/hooks/useHeroSlideShow";
import { PrismicNextImage } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { useRef } from "react";

import "./HeroSlideShow.scss";

export default function HeroSlideShow(sliceProps: SliceComponentProps) {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlideIndex,
    currentSlide,
    currentVideoUrl,
    isMuted,
    toggleMute,
    hash,
    waveTrace,
  } = useHeroSlideShow(sliceProps);

  const slideButtonsRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="slice-hero-slideshow">
      <div className="relative h-full w-full">
        {currentVideoUrl ? (
          <video
            key={`video-${currentSlideIndex}-${currentVideoUrl}`}
            className="absolute inset-0 h-full w-full object-cover"
            src={currentVideoUrl}
            muted={isMuted}
            autoPlay
            loop
            playsInline
          />
        ) : (
          currentSlide?.image && (
            <PrismicNextImage
              field={currentSlide.image}
              className="absolute inset-0 h-full w-full object-cover prismic-image"
              fallbackAlt=""
            />
          )
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="content">
          {currentSlide?.title_eyebrow && (
            <Heading4 variant="eyebrow">{currentSlide.title_eyebrow}</Heading4>
          )}
          {currentSlide?.title && (
            <Heading1 variant="hero" className="slideshow-title">
              {currentSlide.title}
            </Heading1>
          )}
          {currentSlide?.cta_text && (
            <div className="a-div">
              <Button>{currentSlide.cta_text}</Button>
            </div>
          )}
          <button onClick={toggleMute} className={`mute-button ${isMuted ? "muted" : ""}`}>
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>
        </div>
      </div>
      <div ref={slideButtonsRef} className="button-wrap">
        {slides.map((slide, slideIndex) => (
          <HeroSlideShowButton
            key={slideIndex}
            slide={slide}
            active={slideIndex === currentSlideIndex}
            onClick={() => setCurrentSlideIndex(slideIndex)}
            hash={hash}
            waveTrace={waveTrace}
          />
        ))}
      </div>
    </section>
  );
}
