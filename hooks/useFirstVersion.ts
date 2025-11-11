import { useClientCollection } from "@/hooks/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useMemo } from "react";

/**
 * Hook to get the first version of a session
 *
 * @param sessionID - Session ID (can be string, null, or undefined)
 * @param creator - Optional creator address to filter by
 * @returns First version document data or null
 *
 * @example
 * ```tsx
 * const firstVersion = useFirstVersion("session123", "0x123...");
 * if (firstVersion) {
 *   console.log(firstVersion.bounce);
 * }
 * ```
 */
export function useFirstVersion(sessionID: string | null | undefined, creator: string = "") {
  const sessID = useMemo(() => sessionID || "", [sessionID]);

  const versionQ = useMemo(() => {
    if (!sessID) return null;

    const constraints: ReturnType<typeof where>[] = [where("sessionID", "==", sessID)];

    if (creator) {
      constraints.push(where("creator", "==", creator));
    }

    return query(
      collection(db, "session-versions"),
      ...constraints,
      orderBy("created", "asc"),
      limit(1),
    );
  }, [sessID, creator]);

  const versionQSnap = useClientCollection(versionQ);

  return useMemo(() => versionQSnap.data[0] || null, [versionQSnap.data]);
}
