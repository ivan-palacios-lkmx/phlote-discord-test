"use client";

import uniq from "lodash/uniq";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./VirtualMemberCount.scss";

interface VirtualMemberCountProps {
  term: string;
  value: string;
}

// TODO: Implement useMemberFilters hook
// This should return an object where each key is a filter term (slug)
// and each value has a .value property that is an array of selected values
function useMemberFilters() {
  const searchParams = useSearchParams();

  // Placeholder implementation - reads all URL params as filters
  // In the real implementation, this should return a reactive object
  // with all filter terms and their values
  const filters: Record<string, { value: string[] }> = {};

  // Get all search params and convert them to filter format
  searchParams.forEach((value, key) => {
    filters[key] = {
      value: value.split(",").filter(Boolean),
    };
  });

  return filters;
}

// TODO: Implement useMembers hook
function useMembers(filters: Record<string, string[]>) {
  // Placeholder implementation
  return {
    totalResults: 0,
  };
}

export default function VirtualMemberCount({ term, value }: VirtualMemberCountProps) {
  const f = useMemberFilters();
  const queryVal = useMemo(() => {
    const currentValues = f[term]?.value || [];
    return uniq([...currentValues, value]);
  }, [f, term, value]);

  const { totalResults } = useMembers({
    [term]: queryVal,
  });

  return <span>{totalResults}</span>;
}
