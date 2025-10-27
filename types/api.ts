export interface SyncUserRequest {
  privyId: string;
  email?: string;
  walletAddresses?: string[];
  displayName?: string;
}

export interface SyncUserResponse {
  success: boolean;
}
