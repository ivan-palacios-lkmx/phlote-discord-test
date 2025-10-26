"use client";

import type { SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";

// Simple carousel component for stems player
function StemsPlayerSlide({ versionID }: { versionID: string }) {
  return (
    <div className="slice-stems-player-slide mr-[7vw] h-[35vw] w-[75vw] md:h-[40vh] md:w-[80vw]">
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-900 text-white">
        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Stem Player</h3>
          <p className="text-sm opacity-70">Version ID: {versionID}</p>
          <div className="mt-4 h-32 w-32 rounded-full bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
}

export default function StemsPlayer({ slice }: SliceComponentProps) {
  const [ready, setReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Get version IDs from slice data
  const versionIDs =
    (
      slice as unknown as {
        primary?: {
          stemsCarousel?: string[];
        };
      }
    ).primary?.stemsCarousel || [];

  // Initialize carousel when component mounts and data is available
  useEffect(() => {
    if (versionIDs.length === 0) return;

    const initCarousel = async () => {
      // Small delay to ensure DOM is ready
      await new Promise((res) => setTimeout(res, 100));

      if (containerRef.current && scrollRef.current) {
        // Simple horizontal scroll carousel
        const scrollContainer = scrollRef.current;

        // Add scroll behavior
        scrollContainer.style.scrollBehavior = "smooth";
        scrollContainer.style.scrollSnapType = "x mandatory";

        // Show element
        setReady(true);
      }
    };

    initCarousel();
  }, [versionIDs.length]);

  // Handle scroll to show current item
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const slideWidth = scrollRef.current.children[0]?.clientWidth || 0;
    const scrollLeft = slideWidth * index;
    scrollRef.current.scrollLeft = scrollLeft;
    setCurrentIndex(index);
  };

  // Auto-scroll functionality (optional)
  useEffect(() => {
    if (!ready || versionIDs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % versionIDs.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [ready, versionIDs.length]);

  // Scroll to current index when it changes
  useEffect(() => {
    scrollToIndex(currentIndex);
  }, [currentIndex]);

  if (versionIDs.length === 0) {
    return (
      <section className="overflow-hidden py-[100px] outline-none">
        <div className="text-center text-gray-500">No stems available</div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="overflow-hidden py-[100px] outline-none">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
        }}>
        {versionIDs.map((versionID) => (
          <StemsPlayerSlide key={versionID} versionID={versionID} />
        ))}
      </div>

      {/* Navigation dots */}
      {versionIDs.length > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {versionIDs.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={[
                "h-3 w-3 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/30",
              ].join(" ")}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
