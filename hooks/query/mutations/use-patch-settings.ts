import Api from "@/hooks/query/api";
import { SettingsPatch } from "@/types/api";
import { useMutation } from "@tanstack/react-query";

interface PatchSettingsProps {
  patch: SettingsPatch;
}

export function usePatchSettings() {
  return useMutation({
    mutationFn: async ({ patch }: PatchSettingsProps) => {
      return await Api.patchSettings(patch);
    },
  });
}
