"use client";

import useSessionFilters from "@/hooks/useSessionFilters";
import useSessions from "@/hooks/useSessions";
import uniq from "lodash/uniq";
import { useMemo } from "react";

interface VirtualSessionCountProps {
  term: string;
  value: string;
}

export default function VirtualSessionCount({ term, value }: VirtualSessionCountProps) {
  const filters = useSessionFilters();

  const queryVal = useMemo(() => {
    if (term === "tags") {
      const currentValues = filters.tags || [];
      return uniq([...currentValues, value]);
    }
    if (term === "creators") {
      const currentValues = filters.creators || [];
      return uniq([...currentValues, value]);
    }
    if (term === "collaborators") {
      const currentValues = filters.collaborators || [];
      return uniq([...currentValues, value]);
    }
    return [value];
  }, [filters, term, value]);

  const { totalResults } = useSessions({
    tags: term === "tags" ? queryVal : filters.tags,
    creators: term === "creators" ? queryVal : filters.creators,
    collaborators: term === "collaborators" ? queryVal : filters.collaborators,
    search: filters.search,
    minBpm: filters.minBpm,
    maxBpm: filters.maxBpm,
    page: 0,
    pageSize: filters.pageSize,
    sort: filters.sort,
  });

  return <span>{totalResults}</span>;
}
