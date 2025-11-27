"use client";

import Form from "@/components/Form/Form";
import NewProjectForm from "@/components/NewProjectForm/NewProjectForm";
import { usePrismicio } from "@/components/PrismicioProvider";
import VersionFormButton from "@/components/VersionFormButton/VersionFormButton";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetSession } from "@/hooks/query/query-hooks/use-get-session";
import { SessionDoc, VersionDoc } from "@/types/database";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import { PrismicRichText } from "@prismicio/react";
import { usePrivy } from "@privy-io/react-auth";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { z } from "zod";

import "./page.scss";

export default function NewVersionPage() {
  const { settings } = usePrismicio();
  const { sessionID } = useParams<{ sessionID: string }>();
  const { user } = usePrivy();
  const [height] = useState(0);
  const { data: session } = useGetSession(sessionID);
  const titleWrapRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (formValues: z.infer<typeof newVersionFormSchema>) => {
    console.log("Create version", { sessionID, creator: user?.wallet?.address || "", formValues });
  };

  return (
    <main className="new-version">
      <div className="contained">
        <Form schema={newVersionFormSchema} handleSubmit={handleSubmit}>
          <div className="title-area">
            <div className="entry">
              <PrismicRichText field={settings.new_session_copy} />
            </div>

            <div className="session-info">
              <div className="artwork" style={{ width: `${height}px` }}>
                <Web3Avatar avatar={session?.creator || ""} />
              </div>

              <div className="title-wrap" ref={titleWrapRef as React.RefObject<HTMLDivElement>}>
                <SessionDetailTitle
                  session={session as SessionDoc}
                  version={null as unknown as VersionDoc}
                />
              </div>
            </div>

            <VersionFormButton type="submit">Create Version</VersionFormButton>
          </div>

          <NewProjectForm />
        </Form>
      </div>
    </main>
  );
}
