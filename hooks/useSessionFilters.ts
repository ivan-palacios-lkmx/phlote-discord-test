import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const arrayify = (v: string | string[] | null | undefined): string[] => {
  if (!v) return [];
  return typeof v === "object" ? (Array.isArray(v) ? v : [v]) : [v];
};

/**
 * Hook to get session filters from URL search parameters
 *
 * @returns Object containing route, search, page, tags, collaborators, creators, minBpm, maxBpm, pageSize, and sort filters
 */
export default function useSessionFilters() {
  const searchParams = useSearchParams();

  const search = useMemo(() => {
    return searchParams.get("s") || "";
  }, [searchParams]);

  const tags = useMemo(() => {
    const tagsParam = searchParams.get("tags");
    return arrayify(tagsParam ? tagsParam.split(",") : null);
  }, [searchParams]);

  const creators = useMemo(() => {
    const creatorsParam = searchParams.get("creators");
    return arrayify(creatorsParam ? creatorsParam.split(",") : null);
  }, [searchParams]);

  const collaborators = useMemo(() => {
    const collaboratorsParam = searchParams.get("collaborators");
    return arrayify(collaboratorsParam ? collaboratorsParam.split(",") : null);
  }, [searchParams]);

  const minBpm = useMemo(() => {
    const minBpmParam = searchParams.get("minBpm");
    return minBpmParam || false;
  }, [searchParams]);

  const maxBpm = useMemo(() => {
    const maxBpmParam = searchParams.get("maxBpm");
    return maxBpmParam || false;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const pageSizeParam = searchParams.get("pageSize");
    return pageSizeParam || 16;
  }, [searchParams]);

  const page = useMemo(() => {
    const pageParam = searchParams.get("page");
    return pageParam || 0;
  }, [searchParams]);

  const sort = useMemo(() => {
    return searchParams.get("sort") || "active";
  }, [searchParams]);

  return {
    route: searchParams,
    search,
    tags,
    creators,
    collaborators,
    minBpm,
    maxBpm,
    page,
    pageSize,
    sort,
  };
}
