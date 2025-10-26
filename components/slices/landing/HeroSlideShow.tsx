"use client";

import Button from "@/components/ui/Button";
import Heading1 from "@/components/ui/Heading1";
import Heading4 from "@/components/ui/Heading4";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import HeroSlideShowButton from "./HeroSlideShowButton";

type UnknownRecord = Record<string, unknown>;

export default function HeroSlideShow({ slice }: SliceComponentProps) {
  const sliceItems = (slice as unknown as { items?: unknown[] }).items;
  const items = useMemo(() => (Array.isArray(sliceItems) ? sliceItems : []), [sliceItems]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState<number[]>(() => items.map(() => 0));

  const containerRef = useRef<HTMLElement | null>(null);
  const buttonWrapRef = useRef<HTMLDivElement | null>(null);
  const scrollTweenStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setProgress(items.map(() => 0));
  }, [items]);

  const activeItem = useMemo<UnknownRecord>(() => {
    const raw = items[activeIndex];
    return (raw && typeof raw === "object" ? (raw as UnknownRecord) : {}) as UnknownRecord;
  }, [items, activeIndex]);

  const videoURL = useMemo(() => {
    const video = activeItem.video as UnknownRecord | undefined;
    const url = (video?.url as string | undefined) ?? "";
    return url;
  }, [activeItem]);

  useEffect(() => {
    const id = setInterval(async () => {
      const videos = Array.from(
        containerRef.current?.querySelectorAll<HTMLVideoElement>("video") ?? [],
      );
      for (const video of videos) {
        // Ensure playback on iOS
        if (video.paused) {
          try {
            await video.play();
          } catch {
            setMuted(true);
            await video.play().catch(() => {});
          }
        }

        const duration = video.duration || 0;
        const ct = video.currentTime || 0;
        const p = duration === 0 ? 0 : Math.min(1, (ct + 0.1) / duration);
        setProgress((prev) => {
          const next = [...prev];
          if (typeof next[activeIndex] === "number") next[activeIndex] = (1 - p) * 100;
          return next;
        });
        if (p >= 0.999 && items.length > 0) {
          setActiveIndex((i) => (i + 1) % items.length);
        }
      }
    }, 1000 / 20);
    return () => clearInterval(id);
  }, [activeIndex, items.length]);

  const scrollToActive = useCallback((idx: number) => {
    const wrap = buttonWrapRef.current;
    if (!wrap) return;
    const child = wrap.querySelector<HTMLElement>(".slideshow-button");
    const buttonWidth = child?.clientWidth ?? 0;
    const targetX = buttonWidth * idx;

    if (scrollTweenStopRef.current) scrollTweenStopRef.current();

    const start = wrap.scrollLeft;
    const duration = 2000;
    const startTime = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      wrap.scrollLeft = start + (targetX - start) * eased;
      if (t < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    scrollTweenStopRef.current = () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    scrollToActive(activeIndex);
    return () => {
      if (scrollTweenStopRef.current) scrollTweenStopRef.current();
    };
  }, [activeIndex, scrollToActive]);

  const titleEyebrow = (activeItem.title_eyebrow as string | undefined) ?? "";
  const title = (activeItem.title as string | undefined) ?? "";
  const descriptionField = activeItem.description as unknown;
  const ctaText = (activeItem.cta_text as string | undefined) ?? "";
  const ctaLinkField = activeItem.cta_link as unknown;

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative h-[95vh] min-h-[800px] overflow-hidden text-white">
      <div className="relative h-full w-full">
        {/* Media */}
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
            // Casting to never to avoid depending on generated types
            field={activeItem.image as unknown as never}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackAlt=""
          />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {titleEyebrow ? <Heading4 variant="eyebrow">{titleEyebrow}</Heading4> : null}
          {title ? <Heading1 variant="hero">{title}</Heading1> : null}

          {typeof descriptionField === "string" ? (
            <p className="entry mx-auto max-w-[600px] text-base md:text-lg">{descriptionField}</p>
          ) : null}

          {ctaLinkField ? <Button variant="blur">{ctaText || "Learn more"}</Button> : null}

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
            progress={progress[i]}
            onClick={() => setActiveIndex(i)}
            onSeek={(seekTo) => {
              console.log(`Seek to ${seekTo} for slide ${i}`);
            }}
          />
        ))}
      </div>
    </section>
  );
}
