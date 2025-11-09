"use client";

import ReleaseBlock from "@/components/slices/landing/ReleaseBlock/ReleaseBlock";
import type { ReleaseCarouselSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import "flickity/css/flickity.css";
import { useEffect, useRef, useState } from "react";

import "./ReleaseCarousel.scss";

export default function ReleaseCarousel({ slice }: SliceComponentProps<ReleaseCarouselSlice>) {
  const carouselRef = useRef<HTMLUListElement | null>(null);
  const flickityRef = useRef<{ destroy: () => void; resize: () => void } | null>(null);
  const [ready, setReady] = useState(false);

  const copy = slice.primary?.copy;
  const items = slice.items || [];

  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") return;

    const initFlickity = async () => {
      // There must be a carousel element, and we
      // must have Flickity available
      // and there must be more than 1 product image
      if (items.length > 3 && carouselRef.current) {
        // Wait for images to load
        // await new Promise((res) => {
        //   return imagesLoaded(carousel.value, () => setTimeout(res, 500))
        // })

        // Dynamically import Flickity only on client side
        const Flickity = (await import("flickity")).default;

        if (typeof Flickity !== "undefined" && !flickityRef.current && carouselRef.current) {
          // Initialize
          flickityRef.current = new Flickity(carouselRef.current, {
            prevNextButtons: false,
            pageDots: false,
            cellAlign: "center",
            wrapAround: true,
            contain: true,
            draggable: true,
          });

          await new Promise((res) => setTimeout(res, 500));
          flickityRef.current.resize();

          // Show element
          setReady(true);
        }
      } else if (items.length <= 3) {
        setReady(true);
      }
    };

    initFlickity();

    // Cleanup
    return () => {
      if (flickityRef.current) {
        flickityRef.current.destroy();
        flickityRef.current = null;
      }
    };
  }, [items.length]);

  return (
    <section className={`slice-release-carousel ${ready ? "ready" : ""}`}>
      {copy && copy.length > 0 && (
        <div className="entry">
          <PrismicRichText field={copy} />
        </div>
      )}

      <ul className="carousel ul-reset" ref={carouselRef}>
        {items.map((release, index) => (
          <li key={index}>
            <ReleaseBlock release={release} />
          </li>
        ))}
      </ul>
    </section>
  );
}
