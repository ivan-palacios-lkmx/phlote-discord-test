import type { ImageField, LinkField, RichTextField } from "@prismicio/client";

export type UnknownSlice = Record<string, unknown>;

export interface HeroSlideShowSlide {
  image?: ImageField;
  video?: {
    link_type?: string;
    key?: string;
    kind?: string;
    id?: string;
    url?: string;
    name?: string;
    size?: string;
  };
  title_eyebrow?: string | null;
  title?: string | null;
  description?: unknown[] | null;
  cta_text?: string | null;
  cta_link?: LinkField | null;
}
export interface HeroSlice {
  slice_type: "hero";
  primary: {
    background_image?: ImageField;
    background_video?: {
      link_type?: string;
      key?: string;
      kind?: string;
      id?: string;
      url?: string;
      name?: string;
      size?: string;
    };
    headline_text?: string;
    copy?: RichTextField;
  };
  items?: unknown[];
  id: string;
  slice_label?: string | null;
}

export interface StemsPlayerSlice {
  slice_type: "stems_player";
  primary: Record<string, unknown>;
  items: unknown[];
  id: string;
  slice_label: string | null;
}
