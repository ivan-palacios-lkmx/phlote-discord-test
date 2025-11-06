"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import HeaderDirectory from "./HeaderDirectory";
import Member from "./Member";

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

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("all");

  const [members] = useState([
    {
      objectID: "0x1234567890abcdef",
      title: "Founder",
      isPublic: true,
      isCreator: true,
      tags: ["web3", "music", "founder", "admin"],
    },
    {
      objectID: "0xabcdef1234567890",
      title: "Lead Developer",
      isPublic: true,
      isAdmin: true,
      tags: ["tech", "blockchain"],
    },
    {
      objectID: "0x9876543210fedcba",
      title: "Music Producer",
      isPublic: true,
      isCreator: true,
      tags: ["music", "production"],
    },
    {
      objectID: "0xfedcba0987654321",
      title: "Community Manager",
      isPublic: true,
      tags: ["community", "social"],
    },
    {
      objectID: "0x1111111111111111",
      title: "Designer",
      isPublic: true,
      isCreator: true,
      tags: ["design", "ui"],
    },
    {
      objectID: "0x2222222222222222",
      title: "Artist",
      isPublic: true,
      tags: ["art", "nft"],
    },
    {
      objectID: "0x3333333333333333",
      title: "Developer",
      isPublic: true,
      tags: ["coding", "web3"],
    },
    {
      objectID: "0x4444444444444444",
      title: "Curator",
      isPublic: true,
      isCreator: true,
      tags: ["curation", "music"],
    },
    {
      objectID: "0x5555555555555555",
      title: "Marketing Lead",
      isPublic: true,
      isAdmin: true,
      tags: ["marketing", "growth"],
    },
    {
      objectID: "0x6666666666666666",
      title: "DJ",
      isPublic: true,
      isCreator: true,
      tags: ["dj", "music"],
    },
    {
      objectID: "0x7777777777777777",
      title: "Collector",
      isPublic: true,
      tags: ["collector", "nft"],
    },
    {
      objectID: "0x8888888888888888",
      title: "Musician",
      isPublic: true,
      isCreator: true,
      tags: ["music", "performance"],
    },
    {
      objectID: "0x9999999999999999",
      title: "Engineer",
      isPublic: true,
      tags: ["engineering", "tech"],
    },
    {
      objectID: "0xaaaaaaaaaaaaaaaa",
      title: "Composer",
      isPublic: true,
      isCreator: true,
      tags: ["composition", "music"],
    },
    {
      objectID: "0xbbbbbbbbbbbbbbbb",
      title: "Moderator",
      isPublic: true,
      tags: ["moderation", "community"],
    },
    {
      objectID: "0xcccccccccccccccc",
      title: "Producer",
      isPublic: true,
      isCreator: true,
      tags: ["production", "audio"],
    },
    {
      objectID: "0xdddddddddddddddd",
      title: "Writer",
      isPublic: true,
      tags: ["writing", "content"],
    },
    {
      objectID: "0xeeeeeeeeeeeeeeee",
      title: "Vocalist",
      isPublic: true,
      isCreator: true,
      tags: ["vocals", "music"],
    },
    {
      objectID: "0xffffffffffffffff",
      title: "Sound Designer",
      isPublic: true,
      tags: ["sound", "design"],
    },
    {
      objectID: "0x0000000000000000",
      title: "Event Organizer",
      isPublic: true,
      tags: ["events", "community"],
    },
  ]);

  const itemsPerPage = 15;
  const totalResults = members.length;
  const currentPage = parseInt(searchParams.get("page") || "0");
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  // Paginate members
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = members.slice(startIndex, endIndex);

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
      <HeaderDirectory
        totalResults={totalResults}
        activeFilters={activeFilters}
        removeFilter={removeFilter}
        sortValue={sortValue}
        setSortValue={setSortValue}
        onFilterClick={() => setFiltersOpen(!filtersOpen)}
      />

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
        {paginatedMembers.map((member, i) => (
          <li key={member.objectID || i} className="min-w-0">
            <Member member={member} />
          </li>
        ))}
      </ul>

      <Pagination pageCount={totalPages} currentPage={currentPage} onPageClick={onPageClick} />
    </section>
  );
}
