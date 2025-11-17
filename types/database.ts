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
 * The Stem interface defines the schema for individual stem audio files.
 *
 * Stems are separate audio tracks that make up a version (e.g., drums, bass, vocals).
 */
export interface Stem {
  /** Unique identifier for the stem */
  id: string;
  /** Name of the stem (e.g., "Drums", "Bass", "Vocals") */
  name: string;
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

/**
 * The SessionVersionDoc interface defines the schema for session version documents.
 *
 * This interface is stored in Firestore and represents a specific version of a music session,
 * including its audio files (bounce and stems), metadata, collaboration data, and statistics.
 */
export interface SessionVersionDoc {
  /** Date the version was created */
  created: Date | string;
  /** Creator address */
  creator: string;
  /** ID of the parent session */
  sessionID: string;
  /** URL or path to the bounce (mixed/master) audio file */
  bounce: string;
  /** Array of stem audio files */
  stems: Array<Stem>;
  /** Version notes or description */
  notes?: string;
  /** List of tags associated with this version */
  tags?: string[];
  /** BPM (beats per minute) for this version */
  bpm: number;
  /** ID of the source version this version was derived from */
  sourceVersion?: string;
  /** Index number of this version within the session */
  versionIndex?: number;
  /** List of collaborator addresses for this version */
  collaborators?: string[];
  /** Total number of plays for this version */
  playCount?: number;
  /** Total number of downloads for this version */
  downloadCount?: number;
}

/**
 * AlgoliaSessionVersion extends SessionVersionDoc with an objectID field.
 *
 * This interface represents version documents returned from Algolia search results.
 * The objectID is used as a unique identifier and can be used to reference the version
 * in various parts of the application (e.g., building URLs, document references).
 */
export interface AlgoliaSessionVersion extends SessionVersionDoc {
  /** Unique identifier for the version, typically the same as the version ID */
  objectID: string;
}

export interface TagCategory {
  name: string;
  options: string[];
}

/**
 * The SettingsDoc interface defines the schema for settings documents.
 *
 * This interface is stored in Firestore and represents the settings for the application,
 * including available member tags, session tags, stems carousel, membership contracts,
 * and available tags.
 */
export interface SettingsDoc {
  /** List of available member tags */
  availableMemberTags?: TagCategory[];
  /** List of available session tags */
  availableSessionTags?: TagCategory[];
  /** List of stems carousel */
  stemsCarousel?: string[];
  /** List of membership contracts */
  membershipContracts?: string[];
  /** @deprecated Use availableMemberTags instead */
  availableLocations?: Array<{ name: string }>;
  /** @deprecated Use availableMemberTags instead */
  availableSkills?: Array<{ name: string }>;
  /** @deprecated Use availableSessionTags instead */
  availableTags?: Record<string, string[]>;
}
