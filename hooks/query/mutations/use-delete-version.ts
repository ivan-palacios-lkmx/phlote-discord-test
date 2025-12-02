import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface DeleteVersionProps {
  versionId: string;
}

export function useDeleteVersion() {
  return useMutation({
    mutationFn: async ({ versionId }: DeleteVersionProps) => {
      return await Api.deleteVersion(versionId);
    },
  });
}
