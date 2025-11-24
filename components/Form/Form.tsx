import useZodForm from "@/hooks/form/use-zod-form";
import { forwardRef } from "react";
import { FormProvider } from "react-hook-form";
import z from "zod";

interface FormProps<Schema extends z.ZodType<any, any, any>> {
  children: React.ReactNode;
  schema: Schema;
  handleSubmit: (formValues: z.infer<Schema>) => void;
  className?: string;
}

const Form = forwardRef<HTMLFormElement, FormProps<any>>(function Form<
  Schema extends z.ZodType<any, any, any>,
>(
  { children, schema, handleSubmit, className }: FormProps<Schema>,
  ref: React.Ref<HTMLFormElement>,
) {
  const { form, onSubmit } = useZodForm(schema, handleSubmit);
  return (
    <FormProvider {...form}>
      <form ref={ref} onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </FormProvider>
  );
});

export default Form;
