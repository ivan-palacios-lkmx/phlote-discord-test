import type { AddressDoc } from "./client";

export interface SyncUserRequest {
  address: string;
}

export interface SyncUserResponse extends AddressDoc {
  success: boolean;
}

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
