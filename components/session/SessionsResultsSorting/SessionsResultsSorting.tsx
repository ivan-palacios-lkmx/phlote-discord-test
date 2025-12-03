"use client";

import MultiRangeSlider from "@/components/MultiRangeSlider/MultiRangeSlider";
import SearchIcon from "@/components/icons/Search";
import FilterCategoryRow from "@/components/slices/landing/Directory/Directory/FilterCategoryRow/FilterCategoryRow";
import FilterMenu from "@/components/slices/landing/Directory/Directory/FilterMenu/FilterMenu";
import FilterTagGroup from "@/components/slices/landing/Directory/Directory/FilterTagGroup/FilterTagGroup";
import SortMenu from "@/components/slices/landing/Directory/Directory/SortMenu/SortMenu";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetMultipleAddressInfo } from "@/hooks/query/query-hooks/use-get-multiple-address-info";
import useMembers from "@/hooks/useMembers";
import useSessionFilters from "@/hooks/useSessionFilters";
import useTags from "@/hooks/useTags";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import "./SessionsResultsSorting.scss";

export default function SessionsResultsSorting() {
  const filters = useSessionFilters();
  const { sessionTags } = useTags();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("active");

  // Get filter values
  const { minBpm, maxBpm, sort } = filters;

  // Watch sort from URL and update local state
  useEffect(() => {
    setSortValue(sort || "active");
  }, [sort]);

  // Handle sort change - only update URL when sortValue changes from user interaction
  const handleSortChange = (newSort: string) => {
    setSortValue(newSort);
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", newSort);
    router.push(`${pathname}?${current.toString()}`);
  };

  // BPM range state
  const [bpmRange, setBpmRange] = useState({
    min: minBpm ? parseInt(String(minBpm), 10) : 60,
    max: maxBpm ? parseInt(String(maxBpm), 10) : 250,
  });

  // Update BPM range when URL changes
  useEffect(() => {
    setBpmRange({
      min: minBpm ? parseInt(String(minBpm), 10) : 60,
      max: maxBpm ? parseInt(String(maxBpm), 10) : 250,
    });
  }, [minBpm, maxBpm]);

  // Handle BPM range change
  const handleBpmRangeChange = (newRange: { min: number; max: number }) => {
    setBpmRange(newRange);
    const current = new URLSearchParams(searchParams.toString());
    current.set("minBpm", newRange.min.toString());
    current.set("maxBpm", newRange.max.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

  // Get 10 most active creators
  const { members } = useMembers({
    search: "",
    types: ["creator"],
    tags: [],
    pageSize: 10,
    page: 0,
    sort: "active",
  });

  const collaborators = useMemo(() => {
    return members.map((m) => m.objectID as string);
  }, [members]);

  const collaboratorQueries = useGetMultipleAddressInfo({
    addresses: collaborators,
    includePrivate: false,
    enabled: collaborators.length > 0,
  });

  const collaboratorMap = useMemo(() => {
    return collaborators.map((address, index) => {
      return {
        address,
        username: collaboratorQueries[index]?.data?.username,
        avatar: collaboratorQueries[index]?.data?.avatar,
      };
    });
  }, [collaborators, collaboratorQueries]);

  // Handle search input
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const current = new URLSearchParams(searchParams.toString());
    const searchValue = e.target.value;
    if (searchValue) {
      current.set("s", searchValue);
    } else {
      current.delete("s");
    }
    router.push(`${pathname}?${current.toString()}`);
  };

  // Get selected tags for FilterTagGroup
  const selectedTags = useMemo(() => {
    return filters.tags;
  }, [filters.tags]);

  // Toggle tag filter
  const toggleTag = (slug: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    const currentTags = filters.tags;
    const isSelected = currentTags.includes(value);

    let newTags: string[];
    if (isSelected) {
      newTags = currentTags.filter((t) => t !== value);
    } else {
      newTags = [...currentTags, value];
    }

    if (newTags.length > 0) {
      current.set("tags", newTags.join(","));
    } else {
      current.delete("tags");
    }
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <div className="sessions-results-sorting">
      <span className="desktop-only">Sort By</span>
      <SortMenu
        value={sortValue}
        onChange={handleSortChange}
        options={["active", "downloads", "plays", "versions"]}
      />
      <button onClick={() => setFiltersOpen(true)} className="toggle-filter btn inverse">
        Filter Sessions
      </button>

      <FilterMenu
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Sessions"
        inverse>
        {/* Search */}
        <div className="search">
          <div className="border">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search"
              defaultValue={filters.search}
              onChange={onSearch}
            />
          </div>
        </div>

        {/* BPM */}
        <div className="bpm">
          <h6>BPM</h6>
          <MultiRangeSlider min={60} max={250} value={bpmRange} onChange={handleBpmRangeChange} />
        </div>

        {/* Tags */}
        {sessionTags.map((cat, index) => (
          <FilterTagGroup
            key={index}
            name={cat.name}
            options={cat.options || []}
            selectedValues={selectedTags}
            onToggle={toggleTag}
          />
        ))}

        {/* Collaborators */}
        <div className="collaborators">
          <h6>Creators</h6>
          {collaboratorMap.map((collaborator) => (
            <FilterCategoryRow
              key={collaborator.address}
              slug="collaborators"
              value={collaborator.address}>
              <Web3Avatar avatar={collaborator.avatar || ""} />
              <Web3Username username={collaborator.username || ""} />
            </FilterCategoryRow>
          ))}
        </div>
      </FilterMenu>
    </div>
  );
}
