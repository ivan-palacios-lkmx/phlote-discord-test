import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetApplicationsProps {
  enabled?: boolean;
}

export function useGetApplications({ enabled = true }: UseGetApplicationsProps = {}) {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const applications = await Api.getApplications();
      return applications;
    },
    enabled,
  });
}
