"use client";

import Form from "@/components/Form/Form";
import NewVersionForm from "@/components/NewVersionForm/NewVersionForm";
import { usePrismicio } from "@/components/PrismicioProvider";
import VersionFormButton from "@/components/VersionFormButton/VersionFormButton";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import { PrismicRichText } from "@prismicio/react";
import { useState } from "react";
import { z } from "zod";

import "./page.scss";

export default function NewSessionPage() {
  const { settings } = usePrismicio();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formValues: z.infer<typeof newVersionFormSchema>) => {
    setLoading(true);
    try {
      console.log("Create version", formValues);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="new-session">
      <div className="contained">
        <Form schema={newVersionFormSchema} handleSubmit={handleSubmit}>
          <div className="title-area">
            <div className="entry">
              <PrismicRichText field={settings.new_session_copy} />
            </div>

            <VersionFormButton type="submit" loading={loading}>
              Create Session
            </VersionFormButton>
          </div>

          <NewVersionForm />
        </Form>
      </div>
    </main>
  );
}
