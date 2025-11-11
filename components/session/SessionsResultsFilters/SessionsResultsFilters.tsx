"use client";

import ActiveFilterContainer from "@/components/containers/ActiveFilterContainer/ActiveFilterContainer";
import FilterButton from "@/components/slices/landing/Directory/Directory/FilterButton/FilterButton";
import useSessionFilters from "@/hooks/useSessionFilters";
import useTags from "@/hooks/useTags";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import "./SessionsResultsFilters.scss";

interface SessionsResultsFiltersProps {
  resultCount: number;
}

export default function SessionsResultsFilters({ resultCount }: SessionsResultsFiltersProps) {
  const filters = useSessionFilters();
  const { decodeTag } = useTags();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get filter values
  const { search, collaborators, tags, minBpm, maxBpm } = filters;

  // Get name for tag display
  const getName = (tag: string) => {
    const { name, value } = decodeTag(tag);
    if (tag.includes("needs:")) return `${name} ${value}`;
    return value;
  };

  // Toggle search
  const toggleSearch = () => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("s");
    router.push(`${pathname}?${current.toString()}`);
  };

  // Toggle collaborator
  const toggleCollaborator = (collaborator: string) => {
    const current = new URLSearchParams(searchParams.toString());
    const currentCollaborators = collaborators.filter((c) => c !== collaborator);
    if (currentCollaborators.length > 0) {
      current.set("collaborators", currentCollaborators.join(","));
    } else {
      current.delete("collaborators");
    }
    router.push(`${pathname}?${current.toString()}`);
  };

  // Toggle filter (tag)
  const toggleFilter = (filter: string) => {
    const current = new URLSearchParams(searchParams.toString());
    const currentTags = tags.filter((t) => t !== filter);
    if (currentTags.length > 0) {
      current.set("tags", currentTags.join(","));
    } else {
      current.delete("tags");
    }
    router.push(`${pathname}?${current.toString()}`);
  };

  // Toggle BPM
  const toggleBpm = () => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("minBpm");
    current.delete("maxBpm");
    router.push(`${pathname}?${current.toString()}`);
  };

  // Clear all filters
  const onClearAll = () => {
    router.push(pathname || "/sessions");
  };

  return (
    <div className="sessions-results-filters">
      <div className="session-count">
        <span>({resultCount}) </span>
        <span>Sessions</span>
      </div>

      <ActiveFilterContainer>
        {search && (
          <FilterButton className="active" onClick={toggleSearch}>
            Search: {search}
          </FilterButton>
        )}

        {collaborators.map((collaborator) => (
          <FilterButton
            key={collaborator}
            address={collaborator}
            className="active"
            onClick={() => toggleCollaborator(collaborator)}>
            {collaborator}
          </FilterButton>
        ))}

        {minBpm && maxBpm && (
          <FilterButton className="active" onClick={toggleBpm}>
            {minBpm} - {maxBpm} BPM
          </FilterButton>
        )}

        {tags.map((tag) => (
          <FilterButton key={tag} className="active" onClick={() => toggleFilter(tag)}>
            {getName(tag)}
          </FilterButton>
        ))}
      </ActiveFilterContainer>

      {tags.length > 1 && (
        <button onClick={onClearAll} className="clear-all desktop-only">
          Clear All
        </button>
      )}
    </div>
  );
}
