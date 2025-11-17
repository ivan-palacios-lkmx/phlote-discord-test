import type { ImageField, LinkField, RichTextField } from "@prismicio/client";
import { Timestamp } from "firebase/firestore";

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

export interface ReleaseCarouselItem {
  image?: ImageField;
  video?:
    | {
        link_type?: string;
        key?: string;
        kind?: string;
        id?: string;
        url?: string;
        name?: string;
        size?: string;
      }
    | { url?: string };
  audio?:
    | {
        link_type?: string;
        key?: string;
        kind?: string;
        id?: string;
        url?: string;
        name?: string;
        size?: string;
      }
    | { url?: string };
  title_eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  cta_text?: string | null;
  cta_link?: LinkField | null;
  creators?: RichTextField | string[];
}

export interface ReleaseCarouselSlice {
  slice_type: "release_carousel";
  primary: {
    copy?: RichTextField;
  };
  items?: ReleaseCarouselItem[];
  id: string;
  slice_label?: string | null;
}

export interface ApplicationFormSlice {
  slice_type: "application_form";
  primary: Record<string, unknown>;
  items?: unknown[];
  id: string;
  slice_label?: string | null;
}

export interface Session {
  id: string;
  name?: string;
  versionCount?: number;
  discordMessageCount?: number;
  discordChannel?: string;
  created?: Timestamp;
  [key: string]: unknown;
}

export interface Version {
  id: string;
  sessionID?: string;
  versionIndex?: number;
  creator?: string;
  tags?: string[];
  bpm?: number;
  playCount?: number;
  downloadCount?: number;
  stems?: Array<{
    name?: string;
    id?: string;
    [key: string]: unknown;
  }>;
  collaborators?: string[];
  bounce?: string;
  created?: Timestamp;
  [key: string]: unknown;
}

export interface ProgressiveMediaProps {
  wrapper?: keyof JSX.IntrinsicElements;
  videoSrc?: string;
  src?: string;
  aspect?: string | number | null;
  innerWrapper?: keyof JSX.IntrinsicElements;
  sizes?: (number | null)[];
  transition?: string;
  hidePreview?: boolean;
  fillSpace?: boolean;
  fit?: "cover" | "contain";
  transparent?: boolean;
  muted?: boolean;
  // Prismic props
  dimensions?: { width: number; height: number };
  alt?: string;
  url?: string;
  field?: ImageField;
}

export interface PrismicSettings {
  app_menu?: AppMenuItem[];
  home_copy?: string;
  main_menu?: MainMenuItem[];
  social_menu?: SocialMenuItem[];
  footer_copy?: RichTextField;
  secondary_menu?: SecondaryMenuItem[];
  body?: RichTextField[];
  meta_title?: string;
  meta_description?: string;
  og_image?: OGImage;
  default_user_image?: DefaultUserImage;
  newsletter_placeholder_text?: NewsletterPlaceholderText;
  newsletter_submit_text?: NewsletterSubmitText;
}

interface OGImage {
  url?: string;
}

interface DefaultUserImage {
  url?: string;
}

interface NewsletterPlaceholderText {
  text?: string;
}

interface NewsletterSubmitText {
  text?: string;
}

interface SocialMenuItem {
  name?: string;
  link?: string;
}

interface SecondaryMenuItem {
  name?: string;
  link?: unknown;
}

interface MainMenuItem {
  name?: string;
  link?: string;
}

interface AppMenuItem {
  name?: string;
  link?: string;
}
