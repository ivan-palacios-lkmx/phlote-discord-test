import useZodForm from "@/hooks/form/use-zod-form";
import { FormProvider } from "react-hook-form";
import z from "zod";

interface FormProps<Schema extends z.ZodType<any, any, any>> {
  children: React.ReactNode;
  schema: Schema;
  handleSubmit: (formValues: z.infer<Schema>) => void;
  className?: string;
}

export default function Form<Schema extends z.ZodType<any, any, any>>({
  children,
  schema,
  handleSubmit,
  className,
}: FormProps<Schema>) {
  const { form, onSubmit } = useZodForm(schema, handleSubmit);
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}
