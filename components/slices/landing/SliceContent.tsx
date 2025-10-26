"use client";

import Heading1 from "@/components/ui/Heading1";
import Heading2 from "@/components/ui/Heading2";
import Heading3 from "@/components/ui/Heading3";
import Heading4 from "@/components/ui/Heading4";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { useEffect, useRef, useState } from "react";

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
      { threshold: 0.15 },
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="mx-auto px-4 text-center max-w-[1600px] my-24">
      <div className="mx-auto max-w-[1000px]">
        {content ? (
          <PrismicRichText
            field={content as never}
            components={{
              paragraph: ({ children }) => (
                <p className="mx-auto max-w-[750px] font-semibold">{children}</p>
              ),
              heading1: ({ children }) => (
                <Heading1 className="mb-4" variant="hero" fit="tighter">
                  {children}
                </Heading1>
              ),
              heading2: ({ children }) => (
                <Heading2 className="mb-4" variant="title">
                  {children}
                </Heading2>
              ),
              heading3: ({ children }) => (
                <Heading3 className="mb-4" variant="title">
                  {children}
                </Heading3>
              ),
              heading4: ({ children }) => (
                <Heading4 className="mb-4" variant="title">
                  {children}
                </Heading4>
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
        ) : (
          <p className="mx-auto max-w-[750px] font-semibold text-gray-500">No content available</p>
        )}
      </div>
    </section>
  );
}
