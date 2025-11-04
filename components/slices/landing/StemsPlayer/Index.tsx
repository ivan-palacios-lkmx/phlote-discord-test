"use client";

import { useFbGlobals } from "@/hooks/useFbGlobals";
import Flickity from "flickity";
import "flickity/css/flickity.css";
import { useEffect, useMemo, useRef, useState } from "react";

import Slice from "./Slice";

export default function StemsPlayer() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const elRef = useRef<HTMLElement | null>(null);
  const flickityRef = useRef<Flickity | null>(null);

  const { settingsDoc } = useFbGlobals();
  const versionIDs = useMemo(() => (settingsDoc?.stemsCarousel as string[]) || [], [settingsDoc]);

  const canMountCarousel = mounted && versionIDs.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canMountCarousel) return;

    const initFlickity = async () => {
      // Init flickity
      await new Promise((res) => setTimeout(res, 100));

      if (typeof Flickity !== "undefined" && !flickityRef.current && elRef.current) {
        // Wait for images to load
        // await new Promise((res) => {
        //   return imagesLoaded(carousel.value, () => setTimeout(res, 500))
        // })

        // Initialize
        flickityRef.current = new Flickity(elRef.current, {
          prevNextButtons: false,
          pageDots: false,
        });

        await new Promise((res) => setTimeout(res, 500));
        flickityRef.current.resize();

        // Show element
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
  }, [canMountCarousel]);

  return (
    <section
      ref={elRef as React.RefObject<HTMLElement>}
      className={`slice-stems-player overflow-hidden py-[100px] outline-none transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
      {versionIDs.map((versionID, index) => (
        <div
          key={versionID || index}
          className="slice-stems-player-slide mr-[7vw] w-[75vw] h-[35vw] md:w-[80vw] md:h-[40vh]">
          <Slice versionID={versionID} />
        </div>
      ))}
    </section>
  );
}
