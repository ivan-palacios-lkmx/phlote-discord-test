import type { SliceZoneComponents, SliceComponentProps } from "@prismicio/react";
import HeroSlideShow from "./landing/HeroSlideShow";

function DefaultSlice({ slice }: SliceComponentProps) {
  return (
    <section className="p-6">
      <div className="text-sm font-mono opacity-70">{(slice).slice_type}</div>
      <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(slice, null, 2)}</pre>
    </section>
  );
}

// Temporary: render all slice types with a default inspector until real components are mapped
export const components: SliceZoneComponents = {
  hero_slideshow: HeroSlideShow,
  // Fallback for unmapped slice types
  _: DefaultSlice as unknown as never,
} as unknown as SliceZoneComponents;
