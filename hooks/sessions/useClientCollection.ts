import type { Query, QuerySnapshot } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

// Type for collection document data
export type CollectionDocumentData = {
  id: string;
  [key: string]: unknown;
};

// Return type for useClientCollection
export interface UseClientCollectionReturn {
  data: CollectionDocumentData[];
  pending: boolean;
  error: Error | null;
  querySnapshot: QuerySnapshot | null;
  stop: () => void;
}

/**
 * React hook equivalent to Vue's useClientCollection.
 * Watches a Firebase query and returns an object with collection data, pending state, error, and querySnapshot.
 *
 * @param queryRef - Firebase query. Can be null, undefined, or false.
 * @returns Object with data, pending, error, querySnapshot, and stop function
 *
 * @example
 * ```tsx
 * import { collection, query, where } from "firebase/firestore";
 * import { useClientCollection } from "@/hooks/useClientCollection";
 *
 * function MyComponent() {
 *   const q = query(collection(db, "items"), where("active", "==", true));
 *   const { data, pending, error } = useClientCollection(q);
 *
 *   if (pending) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data.map((doc) => (
 *         <div key={doc.id}>{doc.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClientCollection(
  queryRef: Query | null | undefined | false,
): UseClientCollectionReturn {
  const [docs, setDocs] = useState<CollectionDocumentData[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [querySnapshot, setQuerySnapshot] = useState<QuerySnapshot | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const stop = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  };

  useEffect(() => {
    stop();

    if (!queryRef) {
      setDocs([]);
      setPending(false);
      setError(null);
      setQuerySnapshot(null);
      return;
    }

    try {
      setPending(true);
      setError(null);

      const unsubscribe = onSnapshot(
        queryRef,
        (snapshot: QuerySnapshot) => {
          const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPending(false);
          setQuerySnapshot(snapshot);
          setDocs(documents);
        },
        (err) => {
          setPending(false);
          setError(err instanceof Error ? err : new Error(String(err)));
          setQuerySnapshot(null);
          setDocs([]);
        },
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      setQuerySnapshot(null);
      setDocs([]);
    }

    return stop;
  }, [queryRef]);

  return {
    data: docs,
    pending,
    error,
    querySnapshot,
    stop,
  };
}
