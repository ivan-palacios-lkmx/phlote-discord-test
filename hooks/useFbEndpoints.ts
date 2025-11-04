/**
 * Hook for Firebase endpoints
 * TODO: Implement getVersionStems function
 */
export function useFbEndpoints() {
  const getVersionStems = async ({ versionID }: { versionID: string }) => {
    // TODO: Implement API call to get version stems
    // Should return { bounce: string, stems: string[] }
    return {
      bounce: "",
      stems: [],
    };
  };

  return {
    getVersionStems,
  };
}
