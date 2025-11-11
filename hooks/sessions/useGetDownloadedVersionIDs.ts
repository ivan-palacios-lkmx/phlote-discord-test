import { useClientCollection } from "@/hooks/sessions/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { map, uniqBy } from "lodash";
import { useMemo } from "react";

/**
 * Hook to get unique version IDs that have been downloaded by a user for a session
 *
 * @param sessionID - Session ID (can be string, null, or undefined)
 * @param userID - User ID (can be string, null, or undefined)
 * @returns Array of unique version IDs that have been downloaded
 *
 * @example
 * ```tsx
 * const downloadedVersionIDs = useGetDownloadedVersionIDs("session123", "user456");
 * console.log("Downloaded versions:", downloadedVersionIDs);
 * ```
 */
export function useGetDownloadedVersionIDs(
  sessionID: string | null | undefined,
  userID: string | null | undefined,
) {
  const sessID = useMemo(() => sessionID || "", [sessionID]);
  const uID = useMemo(() => userID || "", [userID]);

  const activityQ = useMemo(() => {
    if (!sessID || !uID) return null;

    return query(
      collection(db, "activity"),
      where("sessionID", "==", sessID),
      where("type", "==", "DOWNLOAD"),
      where("initiator", "==", uID),
    );
  }, [sessID, uID]);

  const activityRecords = useClientCollection(activityQ);

  return useMemo(() => {
    const uniqueRecords = uniqBy(activityRecords.data, "versionID");
    return map(uniqueRecords, (a) => a.versionID as string).filter(Boolean);
  }, [activityRecords.data]);
}
