import MarketingFooter from "@/components/site/footer/MarketingFooter/MarketingFooter";
import type { SliceComponentProps } from "@prismicio/react";
import type { ComponentType } from "react";

import ApplicationForm from "./landing/ApplicationForm";
import Directory from "./landing/Directory/Directory";
import Hero from "./landing/Hero/Hero";
import HeroSlideShow from "./landing/HeroSlideShow/HeroSlideShow";
import ReleaseCarousel from "./landing/ReleaseCarousel";
import SliceContent from "./landing/SliceContent/SliceContent";
import StemsPlayer from "./landing/StemsPlayer/Index";

function DefaultSlice({ slice }: SliceComponentProps) {
  return (
    <section className="p-6">
      <div className="text-sm font-mono opacity-70">
        {(slice as { slice_type?: string }).slice_type ?? "unknown_slice"}
      </div>
      <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(slice, null, 2)}</pre>
    </section>
  );
}

type SliceMapping = Record<string, ComponentType<SliceComponentProps>>;

export const components: SliceMapping = new Proxy(
  {
    hero: Hero as ComponentType<SliceComponentProps>,
    hero_slideshow: HeroSlideShow as ComponentType<SliceComponentProps>,
    content: SliceContent as ComponentType<SliceComponentProps>,
    stems_player: StemsPlayer as ComponentType<SliceComponentProps>,
    marketing_footer: MarketingFooter as ComponentType<SliceComponentProps>,
    directory: Directory as ComponentType<SliceComponentProps>,
    release_carousel: ReleaseCarousel as ComponentType<SliceComponentProps>,
    application_form: ApplicationForm as ComponentType<SliceComponentProps>,
  },
  {
    get(target, prop: string) {
      return (target as SliceMapping)[prop] ?? DefaultSlice;
    },
  },
);
