import { firebaseConfig } from "@/lib/firebase";

/**
 * Hook for accessing app configuration
 * @returns App configuration including firebaseConfig
 */
export function useAppConfig() {
  return {
    firebaseConfig,
  };
}
