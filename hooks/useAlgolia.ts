// @ts-expect-error - algoliasearch not installed. Run: npm i algoliasearch
import algoliasearch from "algoliasearch";

let client: ReturnType<typeof algoliasearch> | null = null;
let sessionIndex: ReturnType<typeof algoliasearch.initIndex> | null = null;
let sessionsDownloadsDesc: ReturnType<typeof algoliasearch.initIndex> | null = null;
let sessionsPlaysDesc: ReturnType<typeof algoliasearch.initIndex> | null = null;
let sessionsUpdatedDesc: ReturnType<typeof algoliasearch.initIndex> | null = null;
let sessionsVersionsDesc: ReturnType<typeof algoliasearch.initIndex> | null = null;
let addressIndex: ReturnType<typeof algoliasearch.initIndex> | null = null;
let addressesRecentDesc: ReturnType<typeof algoliasearch.initIndex> | null = null;
let addressesActiveDesc: ReturnType<typeof algoliasearch.initIndex> | null = null;

/**
 * Hook to initialize Algolia client and get search indexes
 *
 * @returns Object containing Algolia search indexes for sessions and addresses
 */
export default function useAlgolia() {
  // Init algolia
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

  if (!appId || !apiKey) {
    console.warn("Algolia credentials not found in environment variables");
    return {
      sessionIndex: null,
      sessionsDownloadsDesc: null,
      sessionsPlaysDesc: null,
      sessionsUpdatedDesc: null,
      sessionsVersionsDesc: null,
      addressIndex: null,
      addressesRecentDesc: null,
      addressesActiveDesc: null,
    };
  }

  if (!client) {
    client = algoliasearch(appId, apiKey);
  }

  // Session indexes
  if (!sessionIndex) {
    sessionIndex = client.initIndex("sessions");
  }
  if (!sessionsDownloadsDesc) {
    sessionsDownloadsDesc = client.initIndex("sessions_downloads_desc");
  }
  if (!sessionsPlaysDesc) {
    sessionsPlaysDesc = client.initIndex("sessions_plays_desc");
  }
  if (!sessionsUpdatedDesc) {
    sessionsUpdatedDesc = client.initIndex("sessions_updated_desc");
  }
  if (!sessionsVersionsDesc) {
    sessionsVersionsDesc = client.initIndex("sessions_versions_desc");
  }

  // Address indexes
  if (!addressIndex) {
    addressIndex = client.initIndex("addresses");
  }
  if (!addressesRecentDesc) {
    addressesRecentDesc = client.initIndex("addresses_recent_desc");
  }
  if (!addressesActiveDesc) {
    addressesActiveDesc = client.initIndex("addresses_active_desc");
  }

  return {
    sessionIndex,
    sessionsDownloadsDesc,
    sessionsPlaysDesc,
    sessionsUpdatedDesc,
    sessionsVersionsDesc,
    addressIndex,
    addressesRecentDesc,
    addressesActiveDesc,
  };
}
