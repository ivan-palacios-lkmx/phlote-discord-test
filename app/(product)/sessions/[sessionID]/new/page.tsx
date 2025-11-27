"use client";

import NewProjectForm from "@/components/NewProjectForm/NewProjectForm";

import "./page.scss";

export default function NewVersionPage() {
  return (
    <main className="new-version">
      <div className="contained">
        <NewProjectForm type="version" />
      </div>
    </main>
  );
}
