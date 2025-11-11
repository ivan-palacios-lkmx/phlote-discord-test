import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useMemo } from "react";

/**
 * Hook to get a session document by sessionID
 *
 * @param sessionID - Session ID (can be string, null, or undefined)
 * @returns Session document data or null
 *
 * @example
 * ```tsx
 * const session = useSession("session123");
 * if (session) {
 *   console.log(session.name);
 * }
 * ```
 */
export function useSession(sessionID: string | null | undefined) {
  const sessID = useMemo(() => sessionID || "", [sessionID]);

  const docRef = useMemo(() => {
    if (!sessID) return null;
    return doc(db, `sessions/${sessID}`);
  }, [sessID]);

  return useClientDoc(docRef);
}
