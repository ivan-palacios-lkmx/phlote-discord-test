"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input/Input";
import { usePrismicio } from "@/components/PrismicioProvider";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { useSubscribeNewsletter } from "@/hooks/query/mutations/use-subscribe-newsletter";
import { newsletterFormSchema } from "@/utils/zod-schemas";
import { z } from "zod";

export default function NewsletterForm() {
  const { settings } = usePrismicio();
  const {
    mutate: subscribeNewsletter,
    isPending: loading,
    isSuccess: success,
  } = useSubscribeNewsletter();

  const placeholder =
    typeof settings.newsletter_placeholder_text === "string"
      ? settings.newsletter_placeholder_text
      : settings.newsletter_placeholder_text?.text || "Email Address";

  const submitText =
    typeof settings.newsletter_submit_text === "string"
      ? settings.newsletter_submit_text
      : settings.newsletter_submit_text?.text || "Submit";

  const handleSubmit = (formValues: z.infer<typeof newsletterFormSchema>) => {
    subscribeNewsletter({ email: formValues.email });
  };

  return (
    <Form
      schema={newsletterFormSchema}
      handleSubmit={handleSubmit}
      className="newsletter-form"
      defaultValues={{ email: "" }}>
      <div className="border">
        {success ? (
          <span>Thank you</span>
        ) : loading ? (
          <LoadingSpinnerIcon className="loading-spinner" />
        ) : (
          <Input name="email" className="email" type="email" placeholder={placeholder} />
        )}
      </div>

      <button className="btn mono" type="submit" disabled={loading || success}>
        {submitText}
      </button>
    </Form>
  );
}
