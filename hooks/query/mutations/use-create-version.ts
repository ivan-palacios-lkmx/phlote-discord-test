import Api from "@/hooks/query/api";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

interface CreateVersionProps {
  sessionId: string;
  formValues: z.infer<typeof newVersionFormSchema>;
}

export function useCreateVersion() {
  return useMutation({
    mutationFn: async ({ sessionId, formValues }: CreateVersionProps) => {
      const bounceHash = formValues.bounce;
      if (!bounceHash) {
        throw new Error("Bounce is required");
      }

      const tags = formValues.versionTags
        ? formValues.versionTags.flat().filter((tag): tag is string => !!tag)
        : undefined;

      const versionDetails = {
        name: formValues.name,
        bounce: bounceHash,
        stems:
          formValues.stems?.map((stem) => ({
            id: stem.hash,
            name: stem.name,
          })) || [],
        notes: formValues.notes,
        tags,
        bpm: formValues.bpm,
      };

      return await Api.createVersion(sessionId, versionDetails);
    },
  });
}
