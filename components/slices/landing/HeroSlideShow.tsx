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
  const sliceItems = (slice as unknown as { items?: unknown[] }).items;
  const items = useMemo(() => (Array.isArray(sliceItems) ? sliceItems : []), [sliceItems]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const containerRef = useRef<HTMLElement | null>(null);
  const buttonWrapRef = useRef<HTMLDivElement | null>(null);

  const activeItem = useMemo<UnknownRecord>(() => {
    const raw = items[activeIndex];
    return raw && typeof raw === "object" ? (raw as UnknownRecord) : {};
  }, [items, activeIndex]);

  const videoURL = useMemo(() => {
    const video = activeItem.video as UnknownRecord | undefined;
    const url = (video?.url as string | undefined) ?? "";
    return url;
  }, [activeItem]);

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative h-[95vh] min-h-[800px] overflow-hidden text-white">
      <div className="relative h-full w-full">
        {videoURL ? (
          <video
            key={`video-${activeIndex}-${videoURL}`}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoURL}
            muted={muted}
            autoPlay
            playsInline
          />
        ) : (
          <PrismicNextImage
            field={activeItem.image as ImageField}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackAlt=""
          />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {activeItem.title_eyebrow ? (
            <Heading4 variant="eyebrow">{activeItem.title_eyebrow as string}</Heading4>
          ) : null}
          {activeItem.title ? (
            <Heading1 variant="hero">{activeItem.title as string}</Heading1>
          ) : null}

          <Button
            onClick={() => setMuted((m) => !m)}
            variant={muted ? "primary" : "secondary"}
            className="mt-5">
            {muted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </div>

      <div
        ref={buttonWrapRef}
        className="absolute bottom-0 left-0 right-0 flex gap-2 overflow-x-auto px-4 py-6 md:px-8">
        {items.map((it, i) => (
          <HeroSlideShowButton
            key={i}
            slide={it as UnknownRecord}
            active={i === activeIndex}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
