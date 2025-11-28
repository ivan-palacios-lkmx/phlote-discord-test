import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useZodForm<Schema extends z.ZodObject<any>>(
  schema: Schema,
  handleSubmit: (data: z.infer<Schema>) => void,
  defaultValues?: DefaultValues<z.infer<Schema>>,
) {
  const form = useForm<z.infer<Schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const onSubmit = form.handleSubmit(handleSubmit);
  return { form, onSubmit };
}
