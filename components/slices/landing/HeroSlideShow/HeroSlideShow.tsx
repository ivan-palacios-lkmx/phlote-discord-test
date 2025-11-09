"use client";

import PrismicImage from "@/components/Prismic/PrismicImage/PrismicImage";
import HeroSlideShowButton from "@/components/slices/landing/HeroSlideShowButton/HeroSlideShowButton";
import { useHeroSlideShow } from "@/hooks/useHeroSlideShow";
import useIntersect from "@/hooks/useIntersect";
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

  const videoURL = currentVideoUrl || "";

  useIntersect(containerRef, (isIntersecting) => {
    if (isIntersecting) {
      containerRef.current?.classList.add("intersected");
    }
  });

  return (
    <section className="slice-hero-slideshow" ref={containerRef}>
      <div className="slide hero-enter-active hero-leave-active" key={currentSlideIndex}>
        {currentSlide?.image && (
          <PrismicImage
            field={currentSlide.image}
            videoSrc={videoURL}
            fillSpace
            fit="cover"
            muted={isMuted}
          />
        )}

        <div className="overlay" />

        <div className="content">
          {currentSlide?.title_eyebrow && <h5>{currentSlide.title_eyebrow}</h5>}
          {currentSlide?.title && <h1 className="slideshow-title">{currentSlide.title}</h1>}

          {currentSlide?.description && (
            <div className="entry">
              <PrismicRichText field={currentSlide.description as never} />
            </div>
          )}

          {currentSlide?.cta_link && currentSlide?.cta_text && (
            <div
              className="a-div mono"
              onClick={() => {
                const url = (currentSlide.cta_link as { url?: string })?.url || "#";
                if (url !== "#") window.location.href = url;
              }}>
              {currentSlide.cta_text}
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
