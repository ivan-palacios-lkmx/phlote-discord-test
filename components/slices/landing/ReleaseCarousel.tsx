"use client";

import type { RichTextField } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";

import ReleaseBlock from "./ReleaseBlock";

export default function ReleaseCarousel({ slice }: SliceComponentProps) {
  const [ready, setReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLUListElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Get copy and items from slice data
  const copy = (
    slice as unknown as {
      primary?: {
        copy?: RichTextField;
      };
    }
  ).primary?.copy;

  const items =
    (
      slice as unknown as {
        primary?: {
          items?: unknown[];
        };
      }
    ).primary?.items || [];

  // Initialize carousel when component mounts
  useEffect(() => {
    if (items.length === 0) return;

    const initCarousel = async () => {
      // Wait for images to load (placeholder for now)
      await new Promise((res) => setTimeout(res, 500));

      if (carouselRef.current && containerRef.current) {
        // Simple horizontal scroll carousel implementation
        const scrollContainer = carouselRef.current;

        // Add scroll behavior
        scrollContainer.style.scrollBehavior = "smooth";
        scrollContainer.style.scrollSnapType = "x mandatory";

        // Show element
        setReady(true);
      }
    };

    initCarousel();
  }, [items.length]);

  // Handle scroll to show current item
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const slideWidth = carouselRef.current.children[0]?.clientWidth || 0;
    const scrollLeft = slideWidth * index;
    carouselRef.current.scrollLeft = scrollLeft;
    setCurrentIndex(index);
  };

  // Auto-scroll functionality for carousel with more than 3 items
  useEffect(() => {
    if (!ready || items.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [ready, items.length]);

  // Scroll to current index when it changes
  useEffect(() => {
    if (items.length > 3) {
      scrollToIndex(currentIndex);
    }
  }, [currentIndex, items.length]);

  if (items.length === 0) {
    return (
      <section className="slice-release-carousel mt-[150px] mb-[150px] md:mt-[50px] md:mb-[50px] w-full">
        <div className="text-center text-gray-500">No releases available</div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className={[
        "slice-release-carousel mt-[150px] mb-[150px] md:mt-[50px] md:mb-[50px] w-full",
        ready ? "opacity-100" : "opacity-0",
        "transition-opacity duration-1000",
      ].join(" ")}>
      {/* MIGRATED: Prismic content entry section */}
      {copy && (
        <div className="entry max-w-[1000px] mx-auto text-center mb-[90px] md:mb-[40px]">
          <PrismicRichText
            field={copy}
            components={{
              paragraph: ({ children }) => (
                <p className="max-w-[750px] mx-auto font-semibold">{children}</p>
              ),
              heading1: ({ children }) => <h1 className="mb-4 text-4xl font-bold">{children}</h1>,
              heading2: ({ children }) => <h2 className="mb-4 text-3xl font-bold">{children}</h2>,
              heading3: ({ children }) => <h3 className="mb-4 text-2xl font-bold">{children}</h3>,
              hyperlink: ({ children, node }) => (
                <a
                  href={node.data?.url as string}
                  className="standard-button mt-[30px] inline-block rounded-[60px] border border-white/20 bg-black/20 px-6 py-3 font-mono uppercase backdrop-blur-md transition-colors hover:bg-black/40">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      )}

      {/* MIGRATED: Carousel section */}
      <ul
        ref={carouselRef}
        className="carousel overflow-hidden cursor-grab focus:outline-none active:cursor-grabbing flex"
        style={{
          scrollSnapType: "x mandatory",
        }}>
        {items.map((release, index) => (
          <li key={index} className="flex-shrink-0">
            <ReleaseBlock release={release as any} />
          </li>
        ))}
      </ul>

      {/* MIGRATED: Navigation dots for carousel with more than 3 items */}
      {items.length > 3 && (
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={[
                "h-3 w-3 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/30",
              ].join(" ")}
              aria-label={`Go to release ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
