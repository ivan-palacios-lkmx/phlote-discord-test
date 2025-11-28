import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface CreateCreatorApplicationProps {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  info?: string;
  workLink?: string;
  ethAddress: string;
  tracks: Array<{ name: string; id: string }>;
}

export function useCreateCreatorApplication() {
  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      city,
      info,
      workLink,
      ethAddress,
      tracks,
    }: CreateCreatorApplicationProps) => {
      return await Api.createCreatorApplication({
        firstName,
        lastName,
        email,
        city,
        info,
        workLink,
        ethAddress,
        tracks,
      });
    },
  });
}
