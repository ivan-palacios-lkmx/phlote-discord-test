import type { AddressDoc } from "./database";

export interface VersionStemsResponse {
  bounce: string;
  stems: string[];
}

export interface ApplicationTracksResponse {
  tracks: unknown[];
  [key: string]: unknown;
}

export interface DiscordInteractionRequest {
  [key: string]: unknown;
}

export interface DiscordInteractionResponse {
  success: boolean;
  [key: string]: unknown;
}

export interface ImageColorsResponse {
  colors?: unknown[];
  dominant_colors?: {
    vibrant_dark?: { hex: string };
    muted_dark?: { hex: string };
    [key: string]: unknown;
  };
  primary?: string;
  secondary?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  address: AddressDoc;
}

export interface VersionAudioResponse {
  stemsSignedUrls: string[];
  bounceSignedUrl: string;
}

export type AudioAction = "play" | "download";

// TODO: Omit from original type
export interface SessionDetails {
  creator: string;
  name: string;
  bounce: string;
  stems: string[];
  notes: string;
  tags: string[];
  bpm: number;
}

export type AudioProcessingStatus = "pending" | "processing" | "ready" | "failed";

export interface AudioProcessingStatusResponse {
  status: AudioProcessingStatus;
  hash?: string;
}

export interface SubmitAudioResponse {
  tmpName: string;
  status: AudioProcessingStatus;
}

export interface SettingsPatch {
  membershipContracts?: string[];
  stemsCarousel?: string[];
}
