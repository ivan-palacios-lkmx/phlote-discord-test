import type { SliceComponentProps } from "@prismicio/react";
import type { ComponentType } from "react";
import HeroSlideShow from "./landing/HeroSlideShow";

function DefaultSlice({ slice }: SliceComponentProps) {
  return (
    <section className="p-6">
      <div className="text-sm font-mono opacity-70">{(slice as { slice_type?: string }).slice_type ?? "unknown_slice"}</div>
      <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(slice, null, 2)}</pre>
    </section>
  );
}

type SliceMapping = Record<string, ComponentType<SliceComponentProps>>;

export const components: SliceMapping = new Proxy(
  {
    hero_slideshow: HeroSlideShow,
  } as SliceMapping,
  {
    get(target, prop: string) {
      return (target as SliceMapping)[prop] ?? (DefaultSlice as ComponentType<SliceComponentProps>);
    },
  }
);
