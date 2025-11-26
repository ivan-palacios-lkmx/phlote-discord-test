import Api from "@/hooks/query/api";
import { AudioAction, VersionAudioResponse } from "@/types/api";
import { SIGNED_URL_EXPIRATION_TIME_IN_MS } from "@/utils/constants";
import { useQueryClient } from "@tanstack/react-query";

interface GetVersionAudioProps {
  versionID: string;
  action?: AudioAction;
}

export function useGetVersionAudio() {
  const queryClient = useQueryClient();

  const fetchVersionAudio = async ({
    versionID,
    action = "play",
  }: GetVersionAudioProps): Promise<VersionAudioResponse> => {
    return await queryClient.fetchQuery({
      queryKey: ["version-audio", versionID, action],
      queryFn: async (): Promise<VersionAudioResponse> => {
        return await Api.getVersionAudio(versionID, action);
      },
      staleTime: SIGNED_URL_EXPIRATION_TIME_IN_MS,
    });
  };

  return {
    mutateAsync: fetchVersionAudio,
  };
}
