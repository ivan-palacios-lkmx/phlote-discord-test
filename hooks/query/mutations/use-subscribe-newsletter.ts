import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface SubscribeNewsletterProps {
  email: string;
}

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async ({ email }: SubscribeNewsletterProps) => {
      return await Api.subscribeNewsletter(email);
    },
  });
}
