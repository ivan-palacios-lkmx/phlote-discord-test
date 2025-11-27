"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input";
import { usePrismicio } from "@/components/PrismicioProvider";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { db } from "@/lib/firebase";
import { newsletterFormSchema } from "@/utils/zod-schemas";
import { doc, setDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { z } from "zod";

import "./NewsletterForm.scss";

export default function NewsletterForm() {
  const { settings } = usePrismicio();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const placeholder = useMemo(
    () => (settings.newsletter_placeholder_text as string) || "Email Address",
    [settings.newsletter_placeholder_text],
  );

  const submitText = useMemo(
    () => (settings.newsletter_submit_text as string) || "Submit",
    [settings.newsletter_submit_text],
  );

  const handleSubmit = async (formValues: z.infer<typeof newsletterFormSchema>) => {
    setLoading(true);

    try {
      const formattedEmail = String(formValues.email).toLowerCase();
      await setDoc(doc(db, `subscribers/${formattedEmail}`), {
        created: new Date(),
        email: formattedEmail,
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
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
