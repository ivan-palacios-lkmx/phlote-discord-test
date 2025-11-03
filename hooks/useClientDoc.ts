import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

// Type for the document data
export type DocumentData = {
  id: string;
  [key: string]: unknown;
};

/**
 * React hook equivalent to Vue's useClientDoc.
 * Watches a Firebase document reference and returns the document data.
 *
 * @param docRef - Firebase document reference. Can be null or undefined.
 * @returns State containing the document data with id, or null if not loaded
 *
 * @example
 * ```tsx
 * import { doc } from "firebase/firestore";
 * import { useClientDoc } from "@/hooks/useClientDoc";
 *
 * function MyComponent() {
 *   const docRef = doc(db, "collection", "documentId");
 *   const document = useClientDoc(docRef);
 *
 *   if (!document) return <div>Loading...</div>;
 *   return <div>{document.title}</div>;
 * }
 * ```
 */
export function useClientDoc(docRef: DocumentReference | null | undefined): DocumentData | null {
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clear previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // If no document reference, reset doc to null
    if (!docRef) {
      setDoc(null);
      return;
    }

    // Subscribe to document changes
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot) => {
        const documentData = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        setDoc(documentData);
      },
      (error) => {
        console.error("Firestore Error:", error);
      },
    );

    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [docRef]);

  return doc;
}
