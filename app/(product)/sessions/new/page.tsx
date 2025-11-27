"use client";

import NewProjectForm from "@/components/NewProjectForm/NewProjectForm";

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
