/**
 * The AddressDoc interface defines the schema for address-related user documents.
 *
 * This interface is stored in both Firestore and Algolia. It is used to represent member addresses,
 * their roles, contribution data, and associated metadata, as well as connected ENS, OpenSea, and Zora information.
 */
export interface AddressDoc {
  /** Unique address ID (also used as the Firestore/Algolia object ID) */
  id: string;
  /** Date the address was created */
  created?: Date;
  /** Date the address was last updated */
  updated?: Date;
  /**
   * @deprecated This is deprecated.
   * Flag indicating if the address should be updated.
   */
  shouldUpdate?: boolean;
  /** Flag indicating if this address belongs to an admin */
  isAdmin?: boolean;
  /** Flag indicating if this address belongs to a creator */
  isCreator?: boolean;
  /** Flag indicating if this address belongs to a member */
  isMember?: boolean;
  /** Flag indicating if this address is publicly visible */
  isPublic?: boolean;
  /** Date since the user has been a member */
  memberSince?: Date;
  /** Optional human-readable title */
  title?: string;
  /** List of tags associated with this address */
  tags?: string[];
  /** Number of sessions this address has contributed to */
  sessionsContributed?: number;
  /** ENS (Ethereum Name Service) information */
  ens?: ENSData;
  /** OpenSea profile data */
  openSea?: OpenSeaData;
  /** Zora profile data */
  zora?: ZoraData;
  /** Number of errors that occurred for this address */
  errorCount?: number;
  /** Error details or a boolean flag for error presence */
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
