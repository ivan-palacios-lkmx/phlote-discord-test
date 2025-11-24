"use client";

import NewVersionForm from "@/components/NewVersionForm/NewVersionForm";
import { usePrismicio } from "@/components/PrismicioProvider";
import VersionFormButton from "@/components/VersionFormButton/VersionFormButton";
import { PrismicRichText } from "@prismicio/react";
import { useRef, useState } from "react";

import "./page.scss";

export default function NewSessionPage() {
  const { settings } = usePrismicio();
  const [loading, setLoading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submitForm = async () => {
    setLoading(true);
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <main className="new-session">
      <div className="contained">
        <div className="title-area">
          <div className="entry">
            <PrismicRichText field={settings.new_session_copy} />
          </div>

          <VersionFormButton onClick={submitForm} loading={loading} disabled={!formReady}>
            Create Session
          </VersionFormButton>
        </div>

        <NewVersionForm />
      </div>
    </main>
  );
}
