import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const arrayify = (v: string | string[] | null | undefined): string[] => {
  if (!v) return [];
  return typeof v === "object" && !Array.isArray(v) ? [v] : Array.isArray(v) ? v : [v];
};

/**
 * Hook to get member filters from URL search parameters
 *
 * @returns Object containing search, page, tags, types, and sort filters
 */
export default function useMemberFilters() {
  const searchParams = useSearchParams();

  const search = useMemo(() => {
    return searchParams.get("s") || searchParams.get("search") || "";
  }, [searchParams]);

  const page = useMemo(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 0;
  }, [searchParams]);

  const tags = useMemo(() => {
    const tagsParam = searchParams.get("tags");
    return arrayify(tagsParam ? tagsParam.split(",") : null);
  }, [searchParams]);

  const types = useMemo(() => {
    const typesParam = searchParams.get("types");
    return arrayify(typesParam ? typesParam.split(",") : null);
  }, [searchParams]);

  const sort = useMemo(() => {
    return searchParams.get("sort") || "all";
  }, [searchParams]);

  return { search, page, tags, types, sort };
}
