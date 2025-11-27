"use client";

import NewProjectForm from "@/components/NewVersionForm/NewVersionForm";

import "./page.scss";

export default function NewSessionPage() {
  return (
    <main className="new-session">
      <div className="contained">
        <NewProjectForm />
      </div>
    </main>
  );
}
