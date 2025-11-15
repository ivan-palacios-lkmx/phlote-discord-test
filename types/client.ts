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

export interface AddressDoc {
  id: string;
  created?: Date;
  updated?: Date;
  shouldUpdate?: boolean;
  isAdmin?: boolean;
  isCreator?: boolean;
  isMember?: boolean;
  isPublic?: boolean;
  memberSince?: Date;
  title?: string;
  tags?: string[];
  sessionsContributed?: number;
  ens?: ENSData;
  openSea?: OpenSeaData;
  zora?: ZoraData;
  errorCount?: number;
  error?: string | boolean;
}
export interface ENSData {
  name: string | false;
  avatar: string | false;
}
export interface OpenSeaData {
  osUsername: string;
  profileImageURL?: string;
}
export interface ZoraData {
  zoraUsername: string;
  profileImageURL?: string;
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

export interface TagCategory {
  name: string;
  options: string[];
}

export interface SettingsDoc {
  availableMemberTags?: TagCategory[];
  availableSessionTags?: TagCategory[];
  stemsCarousel?: string[];
  membershipContracts?: string[];
  /** @deprecated Use availableMemberTags instead */
  availableLocations?: Array<{ name: string }>;
  /** @deprecated Use availableMemberTags instead */
  availableSkills?: Array<{ name: string }>;
  /** @deprecated Use availableSessionTags instead */
  availableTags?: Record<string, string[]>;
}
