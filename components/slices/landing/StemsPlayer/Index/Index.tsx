"use client";

import Slice from "@/components/slices/landing/StemsPlayer/Slice/Slice";
import { useGetSettings } from "@/hooks/query/query-hooks/use-get-settings";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef } from "react";

export default function StemsPlayer() {
  const { data: settings } = useGetSettings();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
  });

  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof emblaRef === "function") {
      emblaRef(node);
    } else if (emblaRef) {
      (emblaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, settings?.stemsCarousel?.length]);

  const shouldMountCarousel = settings?.stemsCarousel && settings.stemsCarousel.length > 0;

  return (
    <section className="slice-stems-player">
      {shouldMountCarousel ? (
        <div className="embla " ref={setRefs}>
          <div className="embla__container ">
            {settings?.stemsCarousel?.map((versionID, index) => (
              <div key={versionID || index} className="embla__slide slice-stems-player-slide">
                <Slice versionID={versionID} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        settings?.stemsCarousel &&
        settings.stemsCarousel.length > 0 && <Slice versionID={settings.stemsCarousel[0]} />
      )}
    </section>
  );
}
