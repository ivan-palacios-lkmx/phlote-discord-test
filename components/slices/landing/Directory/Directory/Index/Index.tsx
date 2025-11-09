"use client";

import ActiveFilterContainer from "@/components/containers/ActiveFilterContainer/ActiveFilterContainer";
import Member from "@/components/slices/landing/Directory/Member";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import "./Index.scss";

interface DirectoryProps {
  slice: {
    slice_type: string;
    [key: string]: unknown;
  };
}

export default function Directory({ slice: _slice }: DirectoryProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("all");

  // TODO: Implement useMemberFilters, useTags, useMembers hooks
  const memberTags = [
    { name: "Skills", options: ["React", "Vue", "Node.js", "Python"] },
    { name: "Location", options: ["NYC", "LA", "Chicago", "SF"] },
  ];

  // TODO: Replace with useMembers hook
  const members: Array<{ objectID: string; [key: string]: unknown }> = [];

  // Get filter values from URL
  const types = useMemo(() => {
    const typesParam = searchParams.get("types");
    return typesParam ? typesParam.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const tags = useMemo(() => {
    const tagsParam = searchParams.get("tags");
    return tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  }, [searchParams]);

  // TODO: Implement decodeTag
  const decodeTag = (tag: string) => ({ value: tag });

  // Active filters
  const activeFilters = useMemo(() => {
    return [
      ...types.map((t) => ({ slug: "types", value: t, name: t })),
      ...tags.map((t) => ({
        slug: "tags",
        value: t,
        name: decodeTag(t).value,
      })),
    ];
  }, [types, tags]);

  // Remove filter
  const removeFilter = (slug: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    const currentValues = current.get(slug)?.split(",") || [];
    const newValues = currentValues.filter((v) => v !== value);

    if (newValues.length > 0) {
      current.set(slug, newValues.join(","));
    } else {
      current.delete(slug);
    }

    router.push(`${pathname}?${current.toString()}`);
  };

  // Toggle filter
  const toggleFilter = (slug: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    const currentValues = current.get(slug)?.split(",") || [];

    if (currentValues.includes(value)) {
      const newValues = currentValues.filter((v) => v !== value);
      if (newValues.length > 0) {
        current.set(slug, newValues.join(","));
      } else {
        current.delete(slug);
      }
    } else {
      currentValues.push(value);
      current.set(slug, currentValues.join(","));
    }

    router.push(`${pathname}?${current.toString()}`);
  };

  // TODO: Implement useMembers hook
  const totalResults = members.length;
  const itemsPerPage = 20;
  const currentPage = parseInt(searchParams.get("page") || "0");
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  // Pagination handler
  const onPageClick = (page: number) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("page", page.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <section className="slice-directory">
      {/* Header */}
      <div className="header" ref={headerRef}>
        <div className="active-filters">
          <h6>({totalResults}) People</h6>

          <ActiveFilterContainer>
            {activeFilters.map((item, index) => (
              <FilterButton
                key={`${item.slug}-${item.value}-${index}`}
                className="active"
                onClick={() => removeFilter(item.slug, item.value)}>
                {item.name}
              </FilterButton>
            ))}
          </ActiveFilterContainer>
        </div>

        <div className="filter-sort">
          {/* Sort */}
          <span className="desktop-only">Sort By</span>
          <SortMenu
            value={sortValue}
            onChange={setSortValue}
            options={["all", "recent", "most active"]}
          />

          {/* Filter */}
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn">
            Filter Directory
          </button>
        </div>
      </div>

      {/* Filter Menu */}
      <FilterMenu
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Directory">
        {/* Type Filters */}
        <FilterCategoryGroup
          name="Type"
          slug="types"
          options={["admin", "creator", "member"]}
          selectedValues={types}
          onToggle={toggleFilter}
        />

        {/* Location/Skill Filters */}
        {memberTags.map((cat, index) => (
          <FilterTagGroup
            key={index}
            name={cat.name}
            options={cat.options}
            selectedValues={tags}
            onToggle={toggleFilter}
          />
        ))}
      </FilterMenu>

      {/* Grid */}
      <ul className="member-grid ul-reset">
        {members.map((member, i) => (
          <li key={member.objectID || i}>
            <Member
              member={member}
              activeFilters={activeFilters}
              style={{ transitionDelay: `${(i % 4) * 200}ms` }}
            />
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <Paginate
          pageCount={totalPages}
          clickHandler={onPageClick}
          currentPage={currentPage}
          next-class="next"
          prev-class="prev"
        />
      )}
    </section>
  );
}
