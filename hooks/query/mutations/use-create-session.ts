import Api from "@/hooks/query/api";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

interface CreateSessionProps {
  creator: string;
  formValues: z.infer<typeof newVersionFormSchema>;
}

export function useCreateSession() {
  return useMutation({
    mutationFn: async ({ creator, formValues }: CreateSessionProps) => {
      const bounceId = formValues.bounce?.id;
      if (!bounceId) {
        throw new Error("Bounce is required");
      }

      const stemsIds = formValues.stems?.map((stem) => stem.id) || [];
      const tags = formValues.catModels
        ? Object.values(formValues.catModels).filter((tag): tag is string => !!tag)
        : undefined;

      const sessionDetails = {
        creator,
        name: formValues.name,
        bounce: bounceId,
        stems: stemsIds,
        notes: formValues.notes,
        tags,
        bpm: formValues.bpm,
      };

      return await Api.createSession(sessionDetails);
    },
  });
}
