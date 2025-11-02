import type { ImageField, LinkField } from "@prismicio/client";

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
