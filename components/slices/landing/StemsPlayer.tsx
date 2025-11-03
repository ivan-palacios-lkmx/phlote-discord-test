"use client";

import type { StemsPlayerSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";

export default function StemsPlayer({ slice }: SliceComponentProps<StemsPlayerSlice>) {
  return (
    <section className="overflow-hidden py-[100px] outline-none">
      <div className="text-center text-gray-500">No stems available</div>
    </section>
  );
}
