"use client";

import { useEffect, useRef, useState } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicImage, PrismicRichText } from "@prismicio/react";
import type { ImageField, RichTextField } from "@prismicio/client";

// MIGRATED: TypeScript interface for Hero slice props
interface HeroSliceProps {
  slice_type: "hero";
  primary: {
    background_image?: ImageField;
    background_video?: {
      url?: string;
    };
    headline_text?: string;
    copy?: RichTextField;
  };
}

export default function Hero({ slice }: SliceComponentProps) {
  // MIGRATED: State management (equivalent to Vue refs)
  const [intersected, setIntersected] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  // MIGRATED: Extract slice data with proper typing
  const heroSlice = slice as unknown as HeroSliceProps;
  const { background_image, background_video, headline_text, copy } = heroSlice.primary || {};

  // MIGRATED: Computed video URL (equivalent to Vue computed)
  const videoURL = background_video?.url || '';

  // MIGRATED: Intersection observer for entrance animations
  useEffect(() => {
    if (!containerRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIntersected(entry.isIntersecting));
      },
      { threshold: 0.15 }
    );

    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="slice-hero relative text-white overflow-hidden"
    >
      {/* MIGRATED: Background image/video section */}
      {background_image && (
        <div className="absolute inset-0">
          <PrismicImage
            field={background_image}
            className="w-full h-full object-cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* MIGRATED: Video overlay if video URL exists */}
          {videoURL && (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={videoURL} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      {/* MIGRATED: Overlay */}
      <div className="overlay absolute inset-0 bg-black/40" />

      {/* MIGRATED: Content section */}
      <div
        className={[
          "content absolute inset-0 flex flex-col justify-center items-center text-center px-8 transition-transform duration-[3000ms]",
          // MIGRATED: Float up animation if first slice and not intersected
          !intersected ? "transform translate-y-screen" : "transform translate-y-0"
        ].join(" ")}
      >
        {/* MIGRATED: Headline */}
        {headline_text && (
          <h1
            className={[
              "headline mb-8 transition-transform duration-[3000ms]",
              // MIGRATED: 3D rotation animation for headline
              !intersected ? "transform-style-preserve-3d transform-perspective-[2000px] rotate-3d-[0.325,1,0.25,360deg]" : "transform-none"
            ].join(" ")}
            style={{
              transformStyle: !intersected ? 'preserve-3d' : undefined,
              transform: !intersected ? 'perspective(2000px) rotate3d(0.325, 1, 0.25, 360deg)' : undefined
            }}
          >
            {headline_text}
          </h1>
        )}

        {/* MIGRATED: Rich text content */}
        {copy && (
          <div className="entry max-w-[750px]">
            <PrismicRichText
              field={copy}
              components={{
                paragraph: ({ children }) => (
                  <p className="mb-4">{children}</p>
                ),
                heading1: ({ children }) => (
                  <h1 className="mb-4 text-4xl font-bold">{children}</h1>
                ),
                heading2: ({ children }) => (
                  <h2 className="mb-4 text-3xl font-bold">{children}</h2>
                ),
                heading3: ({ children }) => (
                  <h3 className="mb-4 text-2xl font-bold">{children}</h3>
                ),
                hyperlink: ({ children, node }) => (
                  <a
                    href={node.data?.url as string}
                    className="standard-button mt-8 inline-block rounded-[60px] border border-white/20 bg-black/20 px-6 py-3 font-mono uppercase backdrop-blur-md transition-colors hover:bg-black/40"
                  >
                    {children}
                  </a>
                ),
              }}
            />
          </div>
        )}
      </div>

      {/* MIGRATED: Mobile responsive styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          .slice-hero {
            height: 90vh;
          }
          .slice-hero .prismic-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </section>
  );
}
