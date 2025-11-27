"use client";

import NewVersionForm from "@/components/NewVersionForm/NewVersionForm";

import "./page.scss";

export default function NewSessionPage() {
  return (
    <main className="new-session">
      <div className="contained">
        <NewVersionForm />
      </div>
    </main>
  );
}
