import { useClientCollection } from "@/hooks/sessions/useClientCollection";
import { db } from "@/lib/firebase";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useMemo } from "react";

/**
 * Hook to get activity records for a session
 *
 * @param sessionID - Session ID (can be string, null, or undefined)
 * @returns Array of activity documents, limited to 60, ordered by document name descending
 *
 * @example
 * ```tsx
 * const activities = useActivity("session123");
 * activities.forEach((activity) => {
 *   console.log(activity.type, activity.initiator);
 * });
 * ```
 */
export function useActivity(sessionID: string | null | undefined) {
  const sessID = useMemo(() => sessionID || "", [sessionID]);

  const activityQ = useMemo(() => {
    if (!sessID) return null;

    return query(
      collection(db, "activity"),
      where("sessionID", "==", sessID),
      orderBy("__name__", "desc"),
      limit(60),
    );
  }, [sessID]);

  const result = useClientCollection(activityQ);
  return result.data;
}
