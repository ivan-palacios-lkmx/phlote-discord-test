"use client";

import ReleaseBlock from "@/components/slices/landing/ReleaseBlock/ReleaseBlock";
import type { ReleaseCarouselSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

import "./ReleaseCarousel.scss";

export default function ReleaseCarousel({ slice }: SliceComponentProps<ReleaseCarouselSlice>) {
  const copy = slice.primary?.copy;
  const items = slice.items || [];
  const [ready, setReady] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: items.length > 3,
  });

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
    if (items.length > 0) {
      setReady(true);
    }
  }, [emblaApi, items.length]);

  return (
    <section className={`slice-release-carousel ${ready ? "ready" : ""}`}>
      {copy && copy.length > 0 && (
        <div className="entry">
          <PrismicRichText field={copy} />
        </div>
      )}

      {items.length > 3 ? (
        <div className="embla" ref={emblaRef}>
          <ul className="embla__container carousel ul-reset">
            {items.map((release, index) => (
              <li key={index} className="embla__slide">
                <ReleaseBlock release={release} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="carousel ul-reset">
          {items.map((release, index) => (
            <li key={index}>
              <ReleaseBlock release={release} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
