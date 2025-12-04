import useAlgolia from "@/hooks/useAlgolia";
import useSessionFilters from "@/hooks/useSessionFilters";
import { AlgoliaSession } from "@/types/database";
import { CACHE_MAX_ITEMS, CACHE_TTL_IN_MS } from "@/utils/constants";
import { quickHash } from "@/utils/functions";
import { debounce } from "lodash";
import { LRUCache } from "lru-cache";
import { useEffect, useMemo, useState } from "react";

// 60 second API cache
const cache = new LRUCache<string, { hits: unknown[]; nbHits: number; nbPages: number }>({
  ttl: CACHE_TTL_IN_MS,
  max: CACHE_MAX_ITEMS,
});

interface UseSessionsOptions {
  search?: string | null;
  collaborators?: string[] | null;
  creators?: string[] | null;
  tags?: string[] | null;
  minBpm?: string | number | false | null;
  maxBpm?: string | number | false | null;
  page?: string | number | null;
  pageSize?: string | number | null;
  sort?: string | null;
}

interface Session {
  objectID: string;
  [key: string]: unknown;
}

interface UseSessionsReturn {
  sessions: AlgoliaSession[];
  loadingSessions: boolean;
  totalResults: number;
  totalPages: number;
  reachedEnd: boolean;
}

/**
 * Hook to fetch and manage session search results from Algolia
 *
 * @param options - Optional parameters to override filter values
 * @returns Object containing sessions array, loading state, and pagination info
 *
 * @example
 * ```tsx
 * const { sessions, loadingSessions, totalResults } = useSessions({
 *   search: "jazz",
 *   creators: ["0x123..."],
 *   page: 0,
 *   pageSize: 20,
 *   sort: "downloads"
 * });
 * ```
 */
export default function useSessions({
  search: pSearch,
  collaborators: pCollaborators,
  creators: pCreators,
  tags: pTags,
  minBpm: pMinBpm,
  maxBpm: pMaxBpm,
  page: pPage,
  pageSize: pPageSize,
  sort: pSort,
}: UseSessionsOptions = {}): UseSessionsReturn {
  const indexes = useAlgolia();
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessions, setSessions] = useState<AlgoliaSession[]>([]);
  const [reachedEnd, setReachedEnd] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const f = useSessionFilters();

  // Resolve values: use provided params or fall back to filter values
  const search = useMemo(() => {
    return pSearch ?? f.search ?? "";
  }, [pSearch, f.search]);

  const collaborators = useMemo(() => {
    return pCollaborators ?? f.collaborators ?? [];
  }, [pCollaborators, f.collaborators]);

  const creators = useMemo(() => {
    return pCreators ?? f.creators ?? [];
  }, [pCreators, f.creators]);

  const tags = useMemo(() => {
    return pTags ?? f.tags ?? [];
  }, [pTags, f.tags]);

  const minBpm = useMemo(() => {
    return pMinBpm ?? f.minBpm ?? false;
  }, [pMinBpm, f.minBpm]);

  const maxBpm = useMemo(() => {
    return pMaxBpm ?? f.maxBpm ?? false;
  }, [pMaxBpm, f.maxBpm]);

  const page = useMemo(() => {
    const pageValue = pPage ?? f.page ?? 0;
    return typeof pageValue === "string" ? parseInt(pageValue, 10) : pageValue;
  }, [pPage, f.page]);

  const pageSize = useMemo(() => {
    const pageSizeValue = pPageSize ?? f.pageSize ?? 16;
    return typeof pageSizeValue === "string" ? parseInt(pageSizeValue, 10) : pageSizeValue;
  }, [pPageSize, f.pageSize]);

  const sort = useMemo(() => {
    return pSort ?? f.sort ?? "active";
  }, [pSort, f.sort]);

  // Set index by sort value
  const activeIndex = useMemo(() => {
    const sessionIdx = indexes.sessionIndex;
    if (!sessionIdx) return null;

    if (sort === "downloads") {
      return indexes.sessionsDownloadsDesc ?? sessionIdx;
    }
    if (sort === "plays") {
      return indexes.sessionsPlaysDesc ?? sessionIdx;
    }
    if (sort === "active") {
      return indexes.sessionsUpdatedDesc ?? sessionIdx;
    }
    if (sort === "versions") {
      return indexes.sessionsVersionsDesc ?? sessionIdx;
    }
    return sessionIdx;
  }, [sort, indexes]);

  // Track when these change - create hash for cache key
  const qHash = useMemo(() => {
    return quickHash(
      JSON.stringify({
        collab: collaborators,
        create: creators,
        tgs: tags,
        s: search,
        mnb: minBpm,
        mxb: maxBpm,
        ps: pageSize,
        page: page,
        sort: sort,
      }),
    );
  }, [collaborators, creators, tags, search, minBpm, maxBpm, pageSize, page, sort]);

  // Build search filter string based on args
  const filtersString = useMemo(() => {
    const out: string[] = [];

    // creators
    if (creators.length > 0) {
      out.push(`(${creators.map((c) => `creator:"${c}"`).join(" OR ")})`);
    }

    // collaborators
    if (collaborators.length > 0) {
      out.push(collaborators.map((c) => `collaborators:"${c}"`).join(" AND "));
    }

    // tags
    if (tags.length > 0) {
      out.push(tags.map((t) => `tags:"${t}"`).join(" AND "));
    }

    // min bpm
    if (minBpm !== false && minBpm !== null && minBpm !== undefined) {
      const minBpmValue = typeof minBpm === "string" ? parseInt(minBpm, 10) : minBpm;
      if (!isNaN(minBpmValue as number)) {
        out.push(`maxBpm >= ${minBpmValue}`);
      }
    }

    // max bpm
    if (maxBpm !== false && maxBpm !== null && maxBpm !== undefined) {
      const maxBpmValue = typeof maxBpm === "string" ? parseInt(maxBpm, 10) : maxBpm;
      if (!isNaN(maxBpmValue as number)) {
        out.push(`minBpm <= ${maxBpmValue}`);
      }
    }

    return out.join(" AND ");
  }, [creators, collaborators, tags, minBpm, maxBpm]);

  // Run full session query with debounce
  const fetchSessionsQuery = useMemo(
    () =>
      debounce(
        async () => {
          if (!activeIndex) {
            setLoadingSessions(false);
            setSessions([]);
            setTotalResults(0);
            setTotalPages(0);
            setReachedEnd(true);
            return;
          }

          setLoadingSessions(true);

          try {
            // Try to pull from cache
            let result: { hits: unknown[]; nbHits: number; nbPages: number };

            if (!cache.has(qHash)) {
              const searchResult = await activeIndex.search(search || "", {
                filters: filtersString,
                hitsPerPage: pageSize,
                page: page,
              });

              result = {
                hits: searchResult.hits,
                nbHits: searchResult.nbHits,
                nbPages: searchResult.nbPages,
              };

              cache.set(qHash, result);
            } else {
              // Cache hit
              result = cache.get(qHash)!;
            }

            setSessions(result.hits as AlgoliaSession[]);
            setTotalResults(result.nbHits);
            setTotalPages(result.nbPages);
            setReachedEnd(page >= result.nbPages - 1);
          } catch (error) {
            console.error("Error fetching sessions:", error);
            setSessions([]);
            setTotalResults(0);
            setTotalPages(0);
            setReachedEnd(true);
          } finally {
            setLoadingSessions(false);
          }
        },
        500,
        { leading: true },
      ),
    [activeIndex, qHash, search, filtersString, pageSize, page],
  );

  // Kick results on mount and when query hash changes
  useEffect(() => {
    fetchSessionsQuery();
    return () => {
      fetchSessionsQuery.cancel();
    };
  }, [fetchSessionsQuery]);

  return {
    sessions,
    loadingSessions,
    totalResults,
    totalPages,
    reachedEnd,
  };
}
