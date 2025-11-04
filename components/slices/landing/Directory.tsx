"use client";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FilterButton = ({
  children,
  active,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] border transition-colors ${
      active ? "border-white/50 bg-white/10" : "border-white/30"
    } ${className}`}>
    {children}
    {/* Placeholder for close icon */}
    {active && <span className="text-[10px]">×</span>}
  </button>
);

const SortMenu = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-transparent border border-white/30 px-2 py-1 text-[11px] font-mono">
    {options.map((option) => (
      <option key={option} value={option} className="bg-black text-white">
        {option}
      </option>
    ))}
  </select>
);

const FilterMenu = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-80 bg-white p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-2xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FilterCategoryGroup = ({
  name,
  slug,
  options,
  selectedValues = [],
  onToggle,
}: {
  name: string;
  slug: string;
  options: string[];
  selectedValues?: string[];
  onToggle: (slug: string, value: string) => void;
}) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold mb-3">{name}</h4>
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => onToggle(slug, option)}
            className="rounded"
          />
          <span className="text-sm capitalize">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const FilterTagGroup = ({
  name,
  options,
  selectedValues = [],
  onToggle,
}: {
  name: string;
  options: string[];
  selectedValues?: string[];
  onToggle: (slug: string, value: string) => void;
}) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold mb-3">{name}</h4>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onToggle("tags", option)}
          className={`px-3 py-1 text-xs border rounded transition-colors ${
            selectedValues.includes(option)
              ? "bg-black text-white border-black"
              : "bg-white text-black border-gray-300"
          }`}>
          {option}
        </button>
      ))}
    </div>
  </div>
);

const DirectoryMember = ({
  member,
  style,
}: {
  member: {
    id: number;
    name: string;
    role: string;
    location: string;
    type: string;
  };
  style?: React.CSSProperties;
}) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded" style={style}>
    <div className="text-center">
      <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3"></div>
      <h3 className="font-semibold mb-1">{member.name || "Member Name"}</h3>
      <p className="text-sm text-white/70">{member.role || "Role"}</p>
      <p className="text-xs text-white/50 mt-2">{member.location || "Location"}</p>
    </div>
  </div>
);

const Pagination = ({
  pageCount,
  currentPage,
  onPageClick,
}: {
  pageCount: number;
  currentPage: number;
  onPageClick: (page: number) => void;
}) => {
  if (pageCount <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-32">
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageClick(i)}
          className={`px-3 py-2 text-[11px] font-mono border border-black/30 rounded transition-colors ${
            currentPage === i ? "bg-black text-white" : "hover:bg-black hover:text-white"
          }`}>
          {i + 1}
        </button>
      ))}
    </div>
  );
};

interface DirectoryProps {
  slice: {
    slice_type: string;
    [key: string]: unknown;
  }; // Prismic slice data
}

export default function Directory({ slice }: DirectoryProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("all");

  const [members] = useState([
    { id: 1, name: "John Doe", role: "Creator", location: "NYC", type: "creator" },
    { id: 2, name: "Jane Smith", role: "Admin", location: "LA", type: "admin" },
    { id: 3, name: "Bob Johnson", role: "Member", location: "Chicago", type: "member" },
    // Add more mock data as needed
  ]);

  const totalResults = members.length;
  const totalPages = Math.ceil(totalResults / 20);

  const activeFilters = [
    ...(searchParams.get("types")?.split(",") || []).map((t) => ({
      slug: "types",
      value: t,
      name: t,
    })),
    ...(searchParams.get("tags")?.split(",") || []).map((t) => ({
      slug: "tags",
      value: t,
      name: t,
    })),
  ];

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

  useEffect(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", sortValue);
    router.push(`${pathname}?${current.toString()}`);
  }, [sortValue, pathname, router, searchParams]);

  const onPageClick = (page: number) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("page", page.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

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

  const memberTags = [
    { name: "Skills", options: ["React", "Vue", "Node.js", "Python"] },
    { name: "Location", options: ["NYC", "LA", "Chicago", "SF"] },
  ];

  return (
    <section className="slice-directory px-8 pb-[150px]">
      <div
        className="header sticky top-0 z-10 bg-white border-b border-black/30 py-2 flex justify-between items-center"
        ref={headerRef}>
        <div className="active-filters flex items-center gap-2 overflow-hidden flex-1">
          <h6 className="font-condensed text-sm whitespace-nowrap m-0">({totalResults}) People</h6>

          <div className="flex items-center gap-2">
            {activeFilters.map((filter, index) => (
              <FilterButton
                key={`${filter.slug}-${filter.value}-${index}`}
                active
                onClick={() => removeFilter(filter.slug, filter.value)}>
                {filter.name}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="filter-sort flex items-center gap-2 relative">
          <span className="hidden md:block text-[11px] font-mono">Sort By</span>

          <Select
            selectOptions={[
              { value: "all", label: "all" },
              { value: "recent", label: "recent" },
              { value: "most active", label: "most active" },
            ]}
            value={sortValue}
            onChange={(value) => setSortValue(value)}
            variant="filter"
          />

          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="btn">
            Filter Directory
          </Button>
        </div>
      </div>

      <FilterMenu
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Directory">
        <FilterCategoryGroup
          name="Type"
          slug="types"
          options={["admin", "creator", "member"]}
          selectedValues={searchParams.get("types")?.split(",") || []}
          onToggle={toggleFilter}
        />

        {memberTags.map((cat, index) => (
          <FilterTagGroup
            key={index}
            name={cat.name}
            options={cat.options}
            selectedValues={searchParams.get("tags")?.split(",") || []}
            onToggle={toggleFilter}
          />
        ))}
      </FilterMenu>

      <ul className="member-grid grid grid-cols-5 gap-[120px_30px] mt-24 list-none">
        {members.map((member, i) => (
          <li key={member.id} className="min-w-0">
            <DirectoryMember member={member} style={{ transitionDelay: `${(i % 4) * 200}ms` }} />
          </li>
        ))}
      </ul>

      <Pagination
        pageCount={totalPages}
        currentPage={parseInt(searchParams.get("page") || "0")}
        onPageClick={onPageClick}
      />
    </section>
  );
}
