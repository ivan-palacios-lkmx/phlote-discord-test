"use client";

import Button from "@/components/ui/Button";
import Heading1 from "@/components/ui/Heading1";
import Heading4 from "@/components/ui/Heading4";
import { useHeroSlideShow } from "@/hooks/useHeroSlideShow";
import { PrismicNextImage } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { useRef } from "react";

import HeroSlideShowButton from "./HeroSlideShowButton";

export default function HeroSlideShow(sliceProps: SliceComponentProps) {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlideIndex,
    currentSlide,
    currentVideoUrl,
    isMuted,
    toggleMute,
  } = useHeroSlideShow(sliceProps);

  const slideButtonsRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="relative h-[95vh] min-h-[800px] overflow-hidden text-white">
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
              className="absolute inset-0 h-full w-full object-cover"
              fallbackAlt=""
            />
          )
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {currentSlide?.title_eyebrow && (
            <Heading4 variant="eyebrow">{currentSlide.title_eyebrow}</Heading4>
          )}
          {currentSlide?.title && <Heading1 variant="hero">{currentSlide.title}</Heading1>}

          <Button onClick={toggleMute} variant={isMuted ? "primary" : "secondary"} className="mt-5">
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </div>

      <div
        ref={slideButtonsRef}
        className="absolute bottom-0 left-0 right-0 flex gap-2 overflow-x-auto px-4 py-6 md:px-8">
        {slides.map((slide, slideIndex) => (
          <HeroSlideShowButton
            key={slideIndex}
            slide={slide}
            active={slideIndex === currentSlideIndex}
            onClick={() => setCurrentSlideIndex(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
