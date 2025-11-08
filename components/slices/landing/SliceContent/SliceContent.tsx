"use client";

import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { useRef } from "react";

import "./SliceContent.scss";

export default function SliceContent({ slice }: SliceComponentProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  // Get content field from slice
  const content = (slice as unknown as { primary?: { content?: unknown } }).primary?.content;

  return (
    <section ref={containerRef as React.RefObject<HTMLElement>} className="slice-content contained">
      {content ? (
        <div className="entry">
          <PrismicRichText field={content as never} />
        </div>
      ) : null}
    </section>
  );
}
