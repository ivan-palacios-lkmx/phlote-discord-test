"use client";

import ApplicationPreviewBlock from "@/components/ApplicationPreviewBlock/ApplicationPreviewBlock";
import type { ApplicationDocWithID } from "@/types/database";

export default function CreatorApplicationsClient() {
  const totalResults = 0;
  const applications: ApplicationDocWithID[] = [];
  const hasNext = false;
  const hasPrev = false;

  const handlePrev = () => {
    // TODO: Implement prev logic
  };

  const handleNext = () => {
    // TODO: Implement next logic
  };

  return (
    <>
      <div className="applications-hero">
        <div className="contained">
          <h2 className="page-title">
            Creator
            <br />
            Applications
          </h2>
        </div>
      </div>

      <div className="meta-row">
        <div className="contained">
          <h6 className="result-total">
            <span className="label">Total Applications:</span>
            <span className="value">{totalResults}</span>
          </h6>
        </div>
      </div>

      <div className="contained">
        <div className="application-grid">
          {applications.map((application) => (
            <ApplicationPreviewBlock key={application.id} application={application} />
          ))}
        </div>
      </div>

      {totalResults > 12 && (
        <div className="pagination-row">
          <button className="btn" disabled={!hasPrev} onClick={handlePrev}>
            Prev
          </button>
          <button className="btn" disabled={!hasNext} onClick={handleNext}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
