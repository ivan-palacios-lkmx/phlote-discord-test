import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useMemo } from "react";

/**
 * React hook for accessing and updating global Firebase settings.
 * Provides access to the global settings document and a function to update it.
 *
 * @returns An object containing:
 * - `db`: The Firestore database instance
 * - `settingsDocRef`: Reference to the global settings document
 * - `settingsDoc`: The current settings document data (or null if not loaded)
 * - `updateSettings`: Async function to update the settings document with merge option
 *
 * @example
 * ```tsx
 * import { useFbGlobals } from "@/hooks/useFbGlobals";
 *
 * function MyComponent() {
 *   const { settingsDoc, updateSettings } = useFbGlobals();
 *
 *   if (!settingsDoc) return <div>Loading...</div>;
 *
 *   const handleUpdate = async () => {
 *     await updateSettings({ someSetting: "new value" });
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current setting: {settingsDoc.someSetting}</p>
 *       <button onClick={handleUpdate}>Update</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useFbGlobals = () => {
  const settingsDocRef = useMemo(() => doc(db, "globals/settings"), []);

  const settingsDoc = useClientDoc(settingsDocRef);

  const updateSettings = async (updates: Record<string, unknown>) => {
    await setDoc(settingsDocRef, updates, { merge: true });
  };

  return {
    db,
    settingsDocRef,
    settingsDoc,
    updateSettings,
  };
};
