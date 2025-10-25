import type { SliceComponentProps } from "@prismicio/react";
import type { ComponentType } from "react";
import HeroSlideShow from "./landing/HeroSlideShow";
import SliceContent from "./landing/SliceContent";
import StemsPlayer from "./landing/StemsPlayer";
import MarketingFooter from "./landing/MarketingFooter";

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
    content: SliceContent,
    stems_player: StemsPlayer,
    marketing_footer: MarketingFooter,
  } as SliceMapping,
  {
    get(target, prop: string) {
      return (target as SliceMapping)[prop] ?? (DefaultSlice as ComponentType<SliceComponentProps>);
    },
  }
);
