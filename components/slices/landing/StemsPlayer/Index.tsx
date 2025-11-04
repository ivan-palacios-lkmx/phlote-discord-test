"use client";

import { useEffect, useRef, useState } from "react";

import Slice from "./Slice";

export default function StemsPlayer() {
  const [mounted, setMounted] = useState(false);
  // const [ready, setReady] = useState(false); // TODO: Use when Flickity is implemented
  const elRef = useRef<HTMLElement | null>(null);

  // const flickityRef = useRef<any>(null); // TODO: Use when Flickity is implemented

  // TODO: Implement useFbGlobals hook
  // const { settingsDoc } = useFbGlobals();
  // const versionIDs = computed(() => settingsDoc.value?.stemsCarousel || []);
  const versionIDs: string[] = []; // TODO: Get from settingsDoc?.stemsCarousel when Firebase is enabled

  const canMountCarousel = mounted && versionIDs.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canMountCarousel) return;

    const initFlickity = async () => {
      // Init flickity
      await new Promise((res) => setTimeout(res, 100));

      // TODO: Implement Flickity initialization
      // if (typeof Flickity != undefined && !flickityRef.current) {
      //   // Wait for images to load
      //   // await new Promise((res) => {
      //   //   return imagesLoaded(carousel.value, () => setTimeout(res, 500))
      //   // })

      //   // Initialize
      //   flickityRef.current = new Flickity(elRef.current, {
      //     prevNextButtons: false,
      //     pageDots: false,
      //   });

      //   await new Promise((res) => setTimeout(res, 500));
      //   flickityRef.current.resize();

      //   // Show element
      //   setReady(true);
      // }
    };

    initFlickity();
  }, [canMountCarousel]);

  return (
    <section
      ref={elRef as React.RefObject<HTMLElement>}
      className="slice-stems-player overflow-hidden py-[100px] outline-none">
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
