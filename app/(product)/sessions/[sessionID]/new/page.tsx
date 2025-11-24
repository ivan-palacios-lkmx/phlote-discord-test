import NewVersionForm from "@/components/NewVersionForm/NewVersionForm";
import { usePrismicio } from "@/components/PrismicioProvider";
import VersionFormButton from "@/components/VersionFormButton/VersionFormButton";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetSession } from "@/hooks/query/query-hooks/use-get-session";
import { SessionDoc, VersionDoc } from "@/types/database";
import { PrismicRichText } from "@prismicio/react";
import { useState } from "react";
import { useRef } from "react";

import "./page.scss";

export default function NewVersionPage({ params }: { params: { sessionID: string } }) {
  const { settings } = usePrismicio();
  const [loading, setLoading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [height, setHeight] = useState(0);
  const { data: session } = useGetSession(params.sessionID);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const submitForm = async () => {
    setLoading(true);
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <main className="new-version">
      <div className="contained">
        <div className="title-area">
          <div className="entry">
            {/* @ts-ignore - Prismic types mismatch with placeholder data */}
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

          <VersionFormButton onClick={submitForm} loading={loading} disabled={!formReady}>
            Create Version
          </VersionFormButton>
        </div>

        <NewVersionForm />
      </div>
    </main>
  );
}
