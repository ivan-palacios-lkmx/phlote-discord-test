export interface SyncUserRequest {
  privyId: string;
  email?: string;
  walletAddresses?: string[];
  displayName?: string;
}

export interface SyncUserResponse {
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
