"use client";

import useMemberFilters from "@/hooks/useMemberFilters";
import useMembers from "@/hooks/useMembers";
import uniq from "lodash/uniq";
import { useMemo } from "react";

interface VirtualMemberCountProps {
  term: string;
  value: string;
}

export default function VirtualMemberCount({ term, value }: VirtualMemberCountProps) {
  const filters = useMemberFilters();

  const queryVal = useMemo(() => {
    if (term === "tags") {
      const currentValues = filters.tags || [];
      return uniq([...currentValues, value]);
    }
    if (term === "types") {
      const currentValues = filters.types || [];
      return uniq([...currentValues, value]);
    }
    return [value];
  }, [filters, term, value]);

  const { totalResults } = useMembers({
    tags: term === "tags" ? queryVal : filters.tags,
    types: term === "types" ? queryVal : filters.types,
    search: filters.search,
    page: 0,
    sort: filters.sort,
  });

  return <span>{totalResults}</span>;
}
