/**
 * The AddressDoc interface defines the schema for address-related user documents.
 *
 * This interface is stored in both Firestore and Algolia. It is used to represent member addresses,
 * their roles, contribution data, and associated metadata, as well as connected ENS, OpenSea, and Zora information.
 */
export interface AddressDoc {
  /** Unique address ID */
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

/**
 * AlgoliaAddress extends AddressDoc with an objectID field.
 *
 * This interface represents address documents returned from Algolia search results.
 * The objectID is used as a unique identifier and can be used to reference the address
 * in various parts of the application (e.g., building URLs, document references).
 */
export interface AlgoliaAddress extends AddressDoc {
  /** Unique identifier for the address, typically the same as the address ID */
  objectID: string;
}

/**
 * The SessionDoc interface defines the schema for session-related documents.
 *
 * This interface is stored in both Firestore and Algolia. It is used to represent music sessions,
 * their metadata, version information, collaboration data, and associated statistics.
 */
export interface SessionDoc {
  /** Session name */
  name: string;
  /** Creator address */
  creator: string;
  /** Date the session was created */
  created: Date | string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Date the image was last updated */
  imageUpdated?: Date | string;
  /** List of collaborator addresses */
  collaborators?: string[];
  /** Total number of versions for this session */
  versionCount?: number;
  /** Session notes or description */
  notes?: string;
  /** List of tags associated with this session */
  tags?: string[];
  /** Minimum BPM (beats per minute) */
  minBpm?: number;
  /** Maximum BPM (beats per minute) */
  maxBpm?: number;
  /** Total number of plays */
  playCount?: number;
  /** Total number of downloads */
  downloadCount?: number;
  /** Date when the session was last active */
  activeLast?: Date | string;
  /** Flag indicating if the session should be processed */
  shouldProcess?: boolean;
  /** Flag indicating if an image should be generated */
  shouldGenerateImage?: boolean;
  /** Flag indicating if a Discord notification should be created */
  createDiscord?: boolean;
  /** Number of errors that occurred for this session */
  errorCount?: number;
  /** Error details or a boolean flag for error presence */
  error?: string | boolean;
}

/**
 * AlgoliaSession extends SessionDoc with an objectID field.
 *
 * This interface represents session documents returned from Algolia search results.
 * The objectID is used as a unique identifier and can be used to reference the session
 * in various parts of the application (e.g., building URLs, document references).
 */
export interface AlgoliaSession extends SessionDoc {
  /** Unique identifier for the session, typically the same as the session ID */
  objectID: string;
}
