"use client";

import Slice from "@/components/slices/landing/StemsPlayer/Slice/Slice";
import { useFbGlobals } from "@/hooks/useFbGlobals";
import "flickity/css/flickity.css";
import { useEffect, useMemo, useRef } from "react";

import "./Index.scss";

export default function StemsPlayer() {
  const elRef = useRef<HTMLElement | null>(null);
  const flickityRef = useRef<{ destroy: () => void; resize: () => void } | null>(null);

  const { settingsDoc } = useFbGlobals();
  const versionIDs = useMemo(() => (settingsDoc?.stemsCarousel as string[]) || [], [settingsDoc]);

  const canMountCarousel = versionIDs.length > 0;

  useEffect(() => {
    if (!canMountCarousel || typeof window === "undefined") return;
    const initFlickity = async () => {
      // Init flickity
      await new Promise((res) => setTimeout(res, 100));

      // Dynamically import Flickity only on client side
      const Flickity = (await import("flickity")).default;

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
    <section ref={elRef as React.RefObject<HTMLElement>} className="slice-stems-player">
      {versionIDs.map((versionID, index) => (
        <Slice key={versionID || index} versionID={versionID} />
      ))}
    </section>
  );
}
