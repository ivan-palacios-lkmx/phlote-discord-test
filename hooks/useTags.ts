import { useFbGlobals } from "@/hooks/useFbGlobals";
import kebabCase from "lodash/kebabCase";
import { useMemo } from "react";

interface TagCategory {
  name: string;
  options?: string[];
}

interface TagMapEntry {
  name: string;
  value: string;
}

const encodeTag = (cat: string, value: string): string => {
  const cleanCat = kebabCase(String(cat).trim());
  const cleanVal = kebabCase(String(value).trim());
  return `${cleanCat}:${cleanVal}`;
};

/**
 * Hook to manage tags for members and sessions
 *
 * @returns Object containing memberTags, sessionTags, encodeTag, decodeTag, and tagMap
 */
export default function useTags() {
  const { settingsDoc } = useFbGlobals();

  const memberTags = useMemo<TagCategory[]>(() => {
    return (settingsDoc?.availableMemberTags as TagCategory[] | undefined) || [];
  }, [settingsDoc]);

  const sessionTags = useMemo<TagCategory[]>(() => {
    return (settingsDoc?.availableSessionTags as TagCategory[] | undefined) || [];
  }, [settingsDoc]);

  const tagMap = useMemo<Record<string, TagMapEntry>>(() => {
    return [...memberTags, ...sessionTags].reduce(
      (map, cat) => {
        if (cat.options && Array.isArray(cat.options)) {
          for (let i = 0; i < cat.options.length; i++) {
            const encoded = encodeTag(cat.name, cat.options[i]);
            map[encoded] = {
              name: cat.name,
              value: cat.options[i],
            };
          }
        }
        return map;
      },
      {} as Record<string, TagMapEntry>,
    );
  }, [memberTags, sessionTags]);

  const decodeTag = (tag: string): TagMapEntry => {
    return tagMap[tag] || { name: "", value: "" };
  };

  return {
    memberTags,
    sessionTags,
    encodeTag,
    decodeTag,
    tagMap,
  };
}
