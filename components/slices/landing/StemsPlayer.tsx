"use client";

import type { StemsPlayerSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { useRef } from "react";

import Badge from "./Badge";
import Mixer from "./Mixer";
import StemControls from "./StemControls";

export default function StemsPlayer({ slice }: SliceComponentProps<StemsPlayerSlice>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
      e.preventDefault();
    }
  };

  return (
    <section className="py-[100px] outline-none">
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="bg-black rounded-lg border border-black p-6 ml-auto mr-[7vw] shadow-2xl h-[35vw] w-[75vw] flex flex-col overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
        tabIndex={0}>
        <div className="flex flex-row items-center justify-start gap-4 shrink-0">
          <div className="bg-white rounded-lg w-16 h-16"></div>
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <div className="bg-white rounded-lg w-4 h-4"></div>
              <span className="text-white uppercase">phlote.eth</span>
            </div>
            <h2 className="text-white uppercase text-left text-[60px] md:text-[90px] lg:text-[120px] tracking-[-0.04em]">
              danny hesher - kindred (135 BPM)
            </h2>
            <div className="flex flex-row gap-2 mt-4">
              <Badge text="135bpm" />
              <Badge text="groovy" />
              <Badge text="laid-back" />
              <Badge text="demo" />
            </div>
          </div>
        </div>
        <div className="mx-6 mt-10 border border-white rounded-lg flex flex-col">
          <Mixer />
          <StemControls />
        </div>
      </div>
    </section>
  );
}
