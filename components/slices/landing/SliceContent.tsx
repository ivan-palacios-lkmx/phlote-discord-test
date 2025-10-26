"use client";

import { useEffect, useRef, useState } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";

export default function SliceContent({ slice }: SliceComponentProps) {
  const [intersected, setIntersected] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  // Get content field from slice
  const content = (slice as unknown as { primary?: { content?: unknown } }).primary?.content;

  // Intersection observer for entrance animation
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

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="mx-auto my-[100px] overflow-hidden px-4 text-center md:my-[50px]"
      style={{
        maskImage: "linear-gradient(black 0 95%, transparent)",
        paddingTop: "8px",
        paddingBottom: "20px",
      }}
    >
      <div
        className={[
          "entry mx-auto max-w-[1000px]",
          intersected ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          "transition-all duration-[3000ms]",
        ].join(" ")}
      >
        {content ? (
          <PrismicRichText
            field={content as never}
            components={{
              paragraph: ({ children }) => (
                <p className="mx-auto max-w-[750px] font-semibold">{children}</p>
              ),
              heading1: ({ children }) => (
                <h1 className="mb-4 text-[9.375rem] font-bold transition-transform duration-[3000ms] font-condensed">
                  {children}
                </h1>
              ),
              heading2: ({ children }) => (
                <h2 className="mb-4 text-[2.25rem] font-bold transition-transform duration-[3000ms] font-condensed">
                  {children}
                </h2>
              ),
              heading3: ({ children }) => (
                <h3 className="mb-4 text-[0.75rem] font-bold transition-transform duration-[3000ms] font-condensed">
                  {children}
                </h3>
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
        ) : (
          <p className="mx-auto max-w-[750px] font-semibold text-gray-500">
            No content available
          </p>
        )}
      </div>
    </section>
  );
}
