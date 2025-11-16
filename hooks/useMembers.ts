import useAlgolia from "@/hooks/useAlgolia";
import useMemberFilters from "@/hooks/useMemberFilters";
import type { AddressDoc, AlgoliaAddress } from "@/types/database";
import { quickHash } from "@/utils/functions";
import { LRUCache } from "lru-cache";
import { useCallback, useEffect, useMemo, useState } from "react";

// 60 second API cache
const cache = new LRUCache<string, { hits: unknown[]; nbHits: number; nbPages: number }>({
  ttl: 1000 * 60 * 1, // 1 minute
  max: 100,
});

interface UseMembersOptions {
  search?: string | null;
  types?: string[] | null;
  tags?: string[] | null;
  page?: number | null;
  pageSize?: number | null;
  sort?: string | null;
}

interface UseMembersReturn {
  members: AlgoliaAddress[];
  loadingMembers: boolean;
  totalResults: number;
  totalPages: number;
  reachedEnd: boolean;
}

/**
 * Hook to fetch and manage member search results from Algolia
 *
 * @param options - Optional parameters to override filter values
 * @returns Object containing members array, loading state, and pagination info
 *
 * @example
 * ```tsx
 * const { members, loadingMembers, totalResults } = useMembers({
 *   search: "john",
 *   types: ["creator"],
 *   page: 0,
 *   pageSize: 15,
 *   sort: "recent"
 * });
 * ```
 */
export default function useMembers({
  search: pSearch,
  types: pTypes,
  tags: pTags,
  page: pPage,
  pageSize: pPageSize,
  sort: pSort,
}: UseMembersOptions = {}): UseMembersReturn {
  const indexes = useAlgolia();
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [members, setMembers] = useState<AlgoliaAddress[]>([]);
  const [reachedEnd, setReachedEnd] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const f = useMemberFilters();

  // Resolve values: use provided params or fall back to filter values
  const search = useMemo(() => {
    return pSearch ?? f.search ?? "";
  }, [pSearch, f.search]);

  const types = useMemo(() => {
    return pTypes ?? f.types ?? [];
  }, [pTypes, f.types]);

  const tags = useMemo(() => {
    return pTags ?? f.tags ?? [];
  }, [pTags, f.tags]);

  const page = useMemo(() => {
    return pPage ?? f.page ?? 0;
  }, [pPage, f.page]);

  const pageSize = useMemo(() => {
    return pPageSize ?? 15;
  }, [pPageSize]);

  const sort = useMemo(() => {
    return pSort ?? f.sort ?? "all";
  }, [pSort, f.sort]);

  // Set index by sort value
  const activeIndex = useMemo(() => {
    if (!indexes.addressIndex) return null;

    if (sort === "recent") {
      return indexes.addressesRecentDesc ?? indexes.addressIndex;
    }
    if (sort === "active") {
      return indexes.addressesActiveDesc ?? indexes.addressIndex;
    }
    return indexes.addressIndex;
  }, [sort, indexes]);

  // Track when these change - create hash for cache key
  const qHash = useMemo(() => {
    return quickHash(
      JSON.stringify({
        s: search,
        types: types,
        tags: tags,
        page: page,
        ps: pageSize,
        sort: sort,
      }),
    );
  }, [search, types, tags, page, pageSize, sort]);

  // Build search filter string based on args
  const filtersString = useMemo(() => {
    // Type filters
    const out: string[] = ["isMember:true"];

    if (types.includes("creator")) {
      out.push("isCreator:true");
    }
    if (types.includes("admin")) {
      out.push("isAdmin:true");
    }

    // Tag filters
    if (tags.length > 0) {
      const tagFilters = tags.map((t) => `tags:"${t}"`);
      out.push(...tagFilters);
    }

    return out.join(" AND ");
  }, [types, tags]);

  // Run full member query
  const fetchMemberQuery = useCallback(async () => {
    if (!activeIndex) {
      setLoadingMembers(false);
      setMembers([]);
      setTotalResults(0);
      setTotalPages(0);
      setReachedEnd(true);
      return;
    }

    setLoadingMembers(true);

    try {
      // Try to pull from cache
      let result: { hits: unknown[]; nbHits: number; nbPages: number };

      if (!cache.has(qHash)) {
        const searchResult = await activeIndex.search(search, {
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

      setMembers(result.hits as AlgoliaAddress[]);
      setTotalResults(result.nbHits);
      setTotalPages(result.nbPages);
      setReachedEnd(page >= result.nbPages - 1);
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
      setTotalResults(0);
      setTotalPages(0);
      setReachedEnd(true);
    } finally {
      setLoadingMembers(false);
    }
  }, [activeIndex, qHash, search, filtersString, pageSize, page]);

  // Kick results on mount and when query hash changes
  useEffect(() => {
    fetchMemberQuery();
  }, [fetchMemberQuery]);

  return {
    members,
    loadingMembers,
    totalResults,
    totalPages,
    reachedEnd,
  };
}
