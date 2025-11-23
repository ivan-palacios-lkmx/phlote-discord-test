import useZodForm from "@/hooks/form/use-zod-form";
import { FormProvider } from "react-hook-form";
import z from "zod";

interface FormProps<Schema extends z.ZodType<any, any, any>> {
  children: React.ReactNode;
  schema: Schema;
  handleSubmit: (formValues: z.infer<Schema>) => void;
}

export default function Form<Schema extends z.ZodType<any, any, any>>({
  children,
  schema,
  handleSubmit,
}: FormProps<Schema>) {
  const { form, onSubmit } = useZodForm(schema, handleSubmit);
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>{children}</form>
    </FormProvider>
  );
}
