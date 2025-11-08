"use client";

import type { HeroSlice } from "@/types/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";

import "./Hero.scss";

export default function Hero({ slice }: SliceComponentProps<HeroSlice>) {
  const [intersected, setIntersected] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const { background_image, background_video, headline_text, copy } = slice.primary || {};

  const videoURL = background_video?.url || "";
  useEffect(() => {
    if (!containerRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIntersected(entry.isIntersecting));
      },
      { threshold: 0.15 },
    );

    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className={`slice-hero ${intersected ? "intersected" : ""}`}>
      {background_image && (
        <>
          <PrismicNextImage field={background_image} className="prismic-image" fallbackAlt="" />
          {videoURL && (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline>
              <source src={videoURL} type="video/mp4" />
            </video>
          )}
        </>
      )}

      <div className="overlay" />

      <div className="content">
        {headline_text && <h1 className="headline">{headline_text}</h1>}

        {copy && (
          <div className="entry">
            <PrismicRichText field={copy} />
          </div>
        )}
      </div>
    </section>
  );
}
