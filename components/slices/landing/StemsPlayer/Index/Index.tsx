"use client";

import Slice from "@/components/slices/landing/StemsPlayer/Slice/Slice";
import { useFbGlobals } from "@/hooks/useFbGlobals";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useRef } from "react";

import "./Index.scss";

export default function StemsPlayer() {
  const { settingsDoc } = useFbGlobals();
  const versionIDs = useMemo(() => (settingsDoc?.stemsCarousel as string[]) || [], [settingsDoc]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
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
  }, [emblaApi, versionIDs.length]);

  const shouldMountCarousel = versionIDs.length > 0;

  return (
    <section className="slice-stems-player">
      {shouldMountCarousel ? (
        <div className="embla" ref={setRefs}>
          <div className="embla__container">
            {versionIDs.map((versionID, index) => (
              <div key={versionID || index} className="embla__slide">
                <Slice versionID={versionID} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        versionIDs.length > 0 && <Slice versionID={versionIDs[0]} />
      )}
    </section>
  );
}
