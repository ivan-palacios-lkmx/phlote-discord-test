import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useMemo } from "react";

/**
 * Hook to get a version document by versionID
 *
 * @param versionID - Version ID (can be string, null, or undefined)
 * @returns Version document data or null
 *
 * @example
 * ```tsx
 * const version = useVersion("version123");
 * if (version) {
 *   console.log(version.bounce);
 * }
 * ```
 */
export function useVersion(versionID: string | null | undefined) {
  const verID = useMemo(() => versionID || "", [versionID]);

  const docRef = useMemo(() => {
    if (!verID) return null;
    return doc(db, `session-versions/${verID}`);
  }, [verID]);

  return useClientDoc(docRef);
}
