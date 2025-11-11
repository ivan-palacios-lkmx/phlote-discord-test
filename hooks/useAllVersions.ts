import { useClientCollection } from "@/hooks/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemo } from "react";

/**
 * Hook to get all versions of a session, sorted by creation date
 *
 * @param sessionID - Session ID (can be string, null, or undefined)
 * @returns Array of version documents sorted by created date (ascending)
 *
 * @example
 * ```tsx
 * const versions = useAllVersions("session123");
 * versions.forEach((version) => {
 *   console.log(version.id, version.created);
 * });
 * ```
 */
export function useAllVersions(sessionID: string | null | undefined) {
  const sessID = useMemo(() => sessionID || "", [sessionID]);

  const versionQ = useMemo(() => {
    if (!sessID) return null;

    return query(collection(db, "session-versions"), where("sessionID", "==", sessID));
  }, [sessID]);

  const versions = useClientCollection(versionQ);

  return useMemo(() => {
    return [...versions.data].sort((a, b) => {
      const aTime =
        a?.created && typeof a.created === "object" && "toDate" in a.created
          ? (a.created.toDate as () => Date)().getTime()
          : 0;
      const bTime =
        b?.created && typeof b.created === "object" && "toDate" in b.created
          ? (b.created.toDate as () => Date)().getTime()
          : 0;
      return aTime - bTime;
    });
  }, [versions.data]);
}
