"use client";

import TrackPreview from "@/components/TrackPreview/TrackPreview";
import type { ApplicationDoc } from "@/types/database";

import "./ApplicationPreviewBlock.scss";

interface ApplicationPreviewBlockProps {
  application?: ApplicationDoc;
  date?: string;
  time?: string;
  tracks?: Array<{ name: string; id: string }>;
  trackURLs?: string[];
}

export default function ApplicationPreviewBlock({
  application,
  date,
  time,
}: ApplicationPreviewBlockProps) {
  return (
    <div className="application-preview-block">
      <div className="grid-data">
        <div className="header-row">
          <h3 className="name">
            {application?.firstName} {application?.lastName}
          </h3>
          <div className="date">
            <span>{date}</span>
            <br />
            <span>{time}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="fields">
            <div className="email">
              <strong>Email: </strong>
              <span>{application?.email}</span>
            </div>
            <div className="city">
              <strong>City: </strong>
              <span>{application?.city}</span>
            </div>
            <div className="wallet-address">
              <strong>Wallet Address: </strong>
              <span>{application?.ethAddress}</span>
            </div>
            <div className="work-link">
              <strong>Work Link: </strong>
              <a href={application?.workLink} target="_blank" rel="noopener noreferrer">
                {application?.workLink || "NONE"}
              </a>
            </div>
          </div>
          <div className="notes-fields">
            <div className="notes-label">
              <strong>Notes:</strong>
            </div>
            <div className="notes-value">
              <i>&quot;{application?.info || "NONE"}&quot;</i>
            </div>
          </div>

          {application?.tracks?.length && application?.tracks?.length > 0 && (
            <div className="tracks">
              <div className="track-label">
                <strong>Example Tracks:</strong>
              </div>
              {application?.tracks?.map((track) => (
                <div key={track.id} className="track-player">
                  <TrackPreview hash={track.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
