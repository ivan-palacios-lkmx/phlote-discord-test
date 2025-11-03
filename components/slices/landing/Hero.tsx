"use client";

import type { HeroSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicImage, PrismicRichText } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";

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
      className="slice-hero relative text-white overflow-hidden h-[90vh] min-h-[800px]">
      {background_image && (
        <div className="absolute inset-0">
          <PrismicImage field={background_image} className="w-full h-full object-cover" />
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
        </div>
      )}

      <div className="overlay absolute inset-0 bg-black/40" />

      <div
        className={[
          "content absolute inset-0 flex flex-col justify-center items-center text-center px-8 transition-transform",
          !intersected ? "transform translate-y-screen" : "transform translate-y-0",
        ].join(" ")}>
        {headline_text && (
          <h1
            className={[
              "mb-8 transition-transform text-[150px] font-bold font-condensed",
              !intersected
                ? "transform-style-preserve-3d transform-perspective-[2000px] rotate-3d-[0.325,1,0.25,360deg]"
                : "transform-none",
            ].join(" ")}
            style={{
              transformStyle: !intersected ? "preserve-3d" : undefined,
              transform: !intersected
                ? "perspective(2000px) rotate3d(0.325, 1, 0.25, 360deg)"
                : undefined,
            }}>
            {headline_text}
          </h1>
        )}

        {copy && (
          <div className="entry max-w-[750px]">
            <PrismicRichText
              field={copy}
              components={{
                paragraph: ({ children }) => <p className="mb-4 text-[12px]">{children}</p>,
                heading1: ({ children }) => (
                  <h1 className="mb-4 text-4xl font-bold text-[150px]">{children}</h1>
                ),
                heading2: ({ children }) => (
                  <h2 className="mb-4 text-3xl font-bold text-[150px]">{children}</h2>
                ),
                heading3: ({ children }) => (
                  <h3 className="mb-4 text-2xl font-bold text-[150px]">{children}</h3>
                ),
                heading4: ({ children }) => (
                  <h4 className="mb-4 text-2xl font-bold text-[36px]">{children}</h4>
                ),
                hyperlink: ({ children, node }) => (
                  <a
                    href={node.data?.url as string}
                    className="standard-button mt-8 inline-block rounded-[60px] border border-white/20 bg-black/20 px-6 py-3 font-mono uppercase backdrop-blur-md transition-colors hover:bg-black/40">
                    {children}
                  </a>
                ),
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
