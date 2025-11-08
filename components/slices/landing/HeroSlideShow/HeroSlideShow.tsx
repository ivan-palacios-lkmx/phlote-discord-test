"use client";

import HeroSlideShowButton from "@/components/slices/landing/HeroSlideShowButton";
import Heading1 from "@/components/ui/Heading1";
import Heading4 from "@/components/ui/Heading4";
import { useHeroSlideShow } from "@/hooks/useHeroSlideShow";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
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

  const containerRef = useRef<HTMLElement>(null);

  return (
    <section className="slice-hero-slideshow" ref={containerRef}>
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

      <div className="overlay" />

      <div className="content">
        {currentSlide?.title_eyebrow && (
          <Heading4 variant="eyebrow">{currentSlide.title_eyebrow}</Heading4>
        )}
        {currentSlide?.title && (
          <Heading1 variant="hero" className="slideshow-title">
            {currentSlide.title}
          </Heading1>
        )}
        {currentSlide?.description && (
          <div className="entry">
            <PrismicRichText field={currentSlide.description as never} />
          </div>
        )}
        {currentSlide?.cta_text && currentSlide?.cta_link && (
          <a href={(currentSlide.cta_link as { url?: string })?.url || "#"} className="a-div mono">
            {currentSlide.cta_text}
          </a>
        )}
        <button onClick={toggleMute} className={`mute-button ${isMuted ? "muted" : ""}`}>
          <span>{isMuted ? "Unmute" : "Mute"}</span>
        </button>
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
