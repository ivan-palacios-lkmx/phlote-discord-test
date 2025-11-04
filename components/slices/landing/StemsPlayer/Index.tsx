"use client";

import { useFbGlobals } from "@/hooks/useFbGlobals";
import "flickity/css/flickity.css";
import { useEffect, useMemo, useRef, useState } from "react";

import Slice from "./Slice";

export default function StemsPlayer() {
  const [ready, setReady] = useState(false);
  const elRef = useRef<HTMLElement | null>(null);
  const flickityRef = useRef<{ destroy: () => void; resize: () => void } | null>(null);

  const { settingsDoc } = useFbGlobals();
  const versionIDs = useMemo(() => (settingsDoc?.stemsCarousel as string[]) || [], [settingsDoc]);

  const canMountCarousel = versionIDs.length > 0;

  useEffect(() => {
    if (!canMountCarousel || typeof window === "undefined") return;
    console.log("Mounting carousel");
    const initFlickity = async () => {
      // Init flickity
      await new Promise((res) => setTimeout(res, 100));

      // Dynamically import Flickity only on client side
      const Flickity = (await import("flickity")).default;

      if (!flickityRef.current && elRef.current) {
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
