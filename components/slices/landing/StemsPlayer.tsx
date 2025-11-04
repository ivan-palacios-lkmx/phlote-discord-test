"use client";

import type { StemsPlayerSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";

import Badge from "./Badge";
import Mixer from "./Mixer";
import StemControls from "./StemControls";

export default function StemsPlayer({ slice }: SliceComponentProps<StemsPlayerSlice>) {
  return (
    <section className="overflow-hidden py-[100px] outline-none">
      <div className="bg-black rounded-lg border border-black p-6 mx-12 shadow-2xl">
        <div className="flex flex-row items-center justify-start gap-4">
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
        <div className="mx-6 mt-10 border border-white rounded-lg flex flex-col overflow-hidden">
          <Mixer />
          <StemControls />
        </div>
      </div>
    </section>
  );
}
