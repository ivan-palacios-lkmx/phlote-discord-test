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
      const bounceHash = formValues.bounce;
      if (!bounceHash) {
        throw new Error("Bounce is required");
      }

      const tags = formValues.versionTags
        ? formValues.versionTags.flat().filter((tag): tag is string => !!tag)
        : undefined;

      const sessionDetails = {
        creator,
        name: formValues.name,
        bounce: bounceHash,
        stems: formValues.stems,
        notes: formValues.notes,
        tags,
        bpm: formValues.bpm,
      };

      return await Api.createSession(sessionDetails);
    },
  });
}
