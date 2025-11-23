import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function useZodForm<Schema extends z.ZodType<any, any, any>>(
  schema: Schema,
  handleSubmit: (data: z.infer<Schema>) => void,
) {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = form.handleSubmit(handleSubmit);
  return { form, onSubmit };
}
