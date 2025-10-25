"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

type UnknownRecord = Record<string, unknown>;

export default function HeroSlideShow({ slice }: SliceComponentProps) {
  const sliceItems = (slice as unknown as { items?: unknown[] }).items;
  const items = useMemo(() => (Array.isArray(sliceItems) ? sliceItems : []), [sliceItems]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState<number[]>(() => items.map(() => 0));
  const [intersected, setIntersected] = useState(false);

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

  // Intersection to trigger entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setIntersected(e.isIntersecting));
      },
      { threshold: 0.15 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-advance & per-frame progress updates similar to original
  useEffect(() => {
    const id = setInterval(async () => {
      const videos = Array.from(containerRef.current?.querySelectorAll<HTMLVideoElement>("video") ?? []);
      for (const video of videos) {
        // Ensure playback on iOS
        if (video.paused) {
          try {
            await video.play();
          } catch {
            // keep muted true if autoplay fails
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

  // Smooth scroll buttons container to active
  const scrollToActive = useCallback(
    (idx: number) => {
      const wrap = buttonWrapRef.current;
      if (!wrap) return;
      const child = wrap.querySelector<HTMLElement>(".slideshow-button");
      const buttonWidth = child?.clientWidth ?? 0;
      const targetX = buttonWidth * idx;

      // cancel previous
      if (scrollTweenStopRef.current) scrollTweenStopRef.current();

      const start = wrap.scrollLeft;
      const duration = 2000;
      const startTime = performance.now();
      let raf = 0;
      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        wrap.scrollLeft = start + (targetX - start) * eased;
        if (t < 1) {
          raf = requestAnimationFrame(step);
        }
      };
      raf = requestAnimationFrame(step);
      scrollTweenStopRef.current = () => cancelAnimationFrame(raf);
    },
    []
  );

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
      className="relative h-[95vh] min-h-[800px] overflow-hidden text-white"
    >
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
            field={(activeItem.image as unknown) as never}
            className="absolute inset-0 h-full w-full object-cover"
            fallbackAlt=""
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div
          className={[
            "pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6",
            intersected ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
            "transition-all duration-[3000ms]",
          ].join(" ")}
        >
          {titleEyebrow ? (
            <h5 className="m-0 text-base md:text-lg">{titleEyebrow}</h5>
          ) : null}
          {title ? (
            <h1 className="slideshow-title my-4 max-w-[1200px] text-[15vh] leading-none md:text-[120px]">
              {title}
            </h1>
          ) : null}

          {/* Description: render as plain text if richtext not mapped yet */}
          {typeof descriptionField === "string" ? (
            <p className="entry mx-auto max-w-[600px] text-base md:text-lg">{descriptionField}</p>
          ) : null}

          {ctaLinkField ? (
            <PrismicNextLink
              field={ctaLinkField as never}
              className="pointer-events-auto mt-5 inline-flex items-center gap-2 rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-black/40"
            >
              {ctaText || "Learn more"}
            </PrismicNextLink>
          ) : null}

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className={[
              "pointer-events-auto mt-10 inline-flex items-center gap-2 rounded-[60px] border px-4 py-2 font-mono uppercase transition-colors",
              muted ? "bg-white text-black border-gray-400" : "bg-black text-white border-gray-500",
            ].join(" ")}
          >
            <span>{muted ? "Unmute" : "Mute"}</span>
          </button>
        </div>
      </div>

      {/* Buttons/progress */}
      <div
        ref={buttonWrapRef}
        className="absolute bottom-0 left-0 right-0 flex gap-2 overflow-x-auto px-4 py-6 md:px-8"
      >
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={[
              "slideshow-button relative h-3 min-w-[120px] flex-1 rounded-full bg-white/20",
              i === activeIndex ? "ring-1 ring-white/60" : "",
            ].join(" ")}
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.9) ${Math.max(
                0,
                Math.min(100, progress[i] ?? 0)
              )}%, transparent 0)`
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
