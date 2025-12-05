"use client";

import PrismicLink from "@/components/Prismic/PrismicLink";
import useIntersect from "@/hooks/useIntersect";
import linkResolver from "@/utils/prismic-link-resolver";
import type { SliceComponentProps } from "@prismicio/react";
import { type JSXMapSerializer, PrismicRichText } from "@prismicio/react";
import { useRef } from "react";

export default function SliceContent({ slice }: SliceComponentProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  useIntersect(containerRef, (isIntersecting) => {
    if (isIntersecting) {
      containerRef.current?.classList.add("intersected");
    }
  });
  // Get content field from slice
  const content = (slice as unknown as { primary?: { content?: unknown } }).primary?.content;

  const components: JSXMapSerializer = {
    hyperlink: ({ node, children }) => {
      return (
        <PrismicLink field={node.data as never} className="">
          {children}
        </PrismicLink>
      );
    },
  };

  return (
    <section ref={containerRef} className="slice-content contained">
      {content ? (
        <div className="entry">
          <PrismicRichText
            field={content as never}
            linkResolver={linkResolver}
            components={components}
          />
        </div>
      ) : null}
    </section>
  );
}
