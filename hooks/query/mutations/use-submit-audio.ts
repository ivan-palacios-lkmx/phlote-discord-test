import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface SubmitAudioProps {
  audioFile: File;
}

export function useSubmitAudio() {
  return useMutation({
    mutationFn: async ({ audioFile }: SubmitAudioProps) => {
      return await Api.submitAudio(audioFile);
    },
  });
}
