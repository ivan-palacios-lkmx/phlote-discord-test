"use client";

import NewProjectForm from "@/components/NewProjectForm/NewProjectForm";
import OnlyCreators from "@/components/OnlyCreators/OnlyCreators";

import "./page.scss";

export default function NewSessionPage() {
  return (
    <OnlyCreators className="new-session">
      <div className="contained">
        <NewProjectForm type="session" />
      </div>
    </OnlyCreators>
  );
}
