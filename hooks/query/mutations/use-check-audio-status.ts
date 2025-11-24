import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface UseCheckAudioStatusProps {
  temporaryAudioFileName: string;
}
export const useCheckAudioStatus = ({ temporaryAudioFileName }: UseCheckAudioStatusProps) => {
  return useMutation({
    mutationFn: () => Api.getAudioProcessingStatus(temporaryAudioFileName),
  });
};
