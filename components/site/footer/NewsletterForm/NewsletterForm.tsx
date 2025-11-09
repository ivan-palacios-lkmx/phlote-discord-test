"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useMemo, useState } from "react";

import "./NewsletterForm.scss";

export default function NewsletterForm() {
  const { settings } = usePrismicio();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(
    () => (settings.newsletter_placeholder_text as string) || "Email Address",
    [settings.newsletter_placeholder_text],
  );

  const submitText = useMemo(
    () => (settings.newsletter_submit_text as string) || "Submit",
    [settings.newsletter_submit_text],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const formattedEmail = String(email).toLowerCase();
      await setDoc(doc(db, `subscribers/${formattedEmail}`), {
        created: new Date(),
        email: formattedEmail,
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setSuccess(true); // Show success even on error (as per template)
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <div className="border">
        {success ? (
          <span>Thank you</span>
        ) : loading ? (
          <LoadingSpinnerIcon className="loading-spinner" />
        ) : (
          <input
            className="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder={placeholder}
          />
        )}
      </div>

      <button className="btn mono" type="submit" disabled={loading || success}>
        {submitText}
      </button>
    </form>
  );
}
