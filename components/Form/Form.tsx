import useZodForm from "@/hooks/form/use-zod-form";
import { FormProvider } from "react-hook-form";
import z from "zod";

// TODO: remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormProps<Schema extends z.ZodObject<any>> {
  children: React.ReactNode;
  schema: Schema;
  handleSubmit: (formValues: z.infer<Schema>) => void;
  className?: string;
}

// TODO: remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Form<Schema extends z.ZodObject<any>>({
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
