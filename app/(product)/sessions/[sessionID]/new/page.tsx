"use client";

import NewProjectForm from "@/components/NewProjectForm/NewProjectForm";
import { useParams, useSearchParams } from "next/navigation";

import "./page.scss";

export default function NewVersionPage() {
  const { sessionID } = useParams();
  const searchParams = useSearchParams();
  const versionID = searchParams.get("versionID");
  return (
    <main className="new-version">
      <div className="contained">
        <NewProjectForm type="version" sessionID={sessionID} versionID={versionID} />
      </div>
    </main>
  );
}
