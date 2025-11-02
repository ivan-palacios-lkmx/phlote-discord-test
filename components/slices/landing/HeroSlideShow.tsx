"use client";

import Button from "@/components/ui/Button";
import Heading1 from "@/components/ui/Heading1";
import Heading4 from "@/components/ui/Heading4";
import { ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { useMemo, useRef, useState } from "react";

import HeroSlideShowButton from "./HeroSlideShowButton";

type UnknownRecord = Record<string, unknown>;

export default function HeroSlideShow({ slice }: SliceComponentProps) {
  const rawSliceItems = (slice as unknown as { items?: unknown[] }).items;
  const slides = useMemo(
    () => (Array.isArray(rawSliceItems) ? rawSliceItems : []),
    [rawSliceItems],
  );

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const slideButtonsRef = useRef<HTMLDivElement | null>(null);

  const currentSlide = useMemo<UnknownRecord>(() => {
    const rawSlideItem = slides[currentSlideIndex];
    return rawSlideItem && typeof rawSlideItem === "object" ? (rawSlideItem as UnknownRecord) : {};
  }, [slides, currentSlideIndex]);

  const currentVideoUrl = useMemo(() => {
    const video = currentSlide.video as UnknownRecord | undefined;
    const videoUrl = (video?.url as string | undefined) ?? "";
    return videoUrl;
  }, [currentSlide]);

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
            playsInline
          />
        ) : (
          <PrismicNextImage
            field={currentSlide.image as ImageField}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackAlt=""
          />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {currentSlide.title_eyebrow ? (
            <Heading4 variant="eyebrow">{currentSlide.title_eyebrow as string}</Heading4>
          ) : null}
          {currentSlide.title ? (
            <Heading1 variant="hero">{currentSlide.title as string}</Heading1>
          ) : null}

          <Button
            onClick={() => setIsMuted((m) => !m)}
            variant={isMuted ? "primary" : "secondary"}
            className="mt-5">
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
            slide={slide as UnknownRecord}
            active={slideIndex === currentSlideIndex}
            onClick={() => setCurrentSlideIndex(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
