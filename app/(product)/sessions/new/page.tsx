"use client";

import Form from "@/components/Form/Form";
import NewVersionForm from "@/components/NewVersionForm/NewVersionForm";
import { usePrismicio } from "@/components/PrismicioProvider";
import VersionFormButton from "@/components/VersionFormButton/VersionFormButton";
import { useCreateSession } from "@/hooks/query/mutations/use-create-session";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import { PrismicRichText } from "@prismicio/react";
import { usePrivy } from "@privy-io/react-auth";
import { z } from "zod";

import "./page.scss";

export default function NewSessionPage() {
  const { settings } = usePrismicio();
  const { user } = usePrivy();
  const { mutate: createSession, isPending } = useCreateSession();

  const handleSubmit = (formValues: z.infer<typeof newVersionFormSchema>) => {
    createSession({ creator: user?.wallet?.address || "", formValues });
  };

  return (
    <main className="new-session">
      <div className="contained">
        <Form schema={newVersionFormSchema} handleSubmit={handleSubmit}>
          <div className="title-area">
            <div className="entry">
              <PrismicRichText field={settings.new_session_copy} />
            </div>

            <VersionFormButton type="submit" loading={isPending}>
              Create Session
            </VersionFormButton>
          </div>

          <NewVersionForm />
        </Form>
      </div>
    </main>
  );
}
