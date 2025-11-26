import Api from "@/hooks/query/api";
import { AudioAction, VersionAudioResponse } from "@/types/api";
import { useMutation } from "@tanstack/react-query";

interface GetVersionAudioProps {
  versionID: string;
  action?: AudioAction;
}

export function useGetVersionAudio() {
  return useMutation({
    mutationFn: async ({
      versionID,
      action = "play",
    }: GetVersionAudioProps): Promise<VersionAudioResponse> => {
      return await Api.getVersionAudio(versionID, action);
    },
  });
}
