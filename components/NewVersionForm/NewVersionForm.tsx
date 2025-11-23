"use client";

import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import SingleTrackUpload from "@/components/SingleTrackUpload/SingleTrackUpload";
import Tooltip from "@/components/Tooltip/Tooltip";
import React, { useState } from "react";

import "./NewVersionForm.scss";

// Placeholder TagGroup
const TagGroup = ({
  name,
  values,
  labels,
  inputType = "checkbox",
  value,
  onChange,
}: {
  name: string;
  values: string[];
  labels: string[];
  inputType?: "checkbox" | "radio";
  value?: any;
  onChange?: (val: any) => void;
}) => {
  return (
    <div className="tag-group">
      {values.map((val, i) => (
        <label key={val} style={{ display: "block", marginBottom: "5px" }}>
          <input
            type={inputType}
            name={name}
            value={val}
            checked={inputType === "radio" ? value === val : value?.includes(val)}
            onChange={(e) => {
              if (inputType === "radio") {
                onChange?.(val);
              } else {
                // handle checkbox logic if needed
                onChange?.(val);
              }
            }}
            style={{ marginRight: "10px" }}
          />
          {labels[i]}
        </label>
      ))}
    </div>
  );
};

interface NewVersionFormProps {
  settings?: any;
  exampleLink?: string;
  parentName?: string;
  mustSelectStarter?: boolean;
  possibleStarterIds?: string[];
  versionLabels?: string[];
  sessionTags?: { name: string; options: string[] }[];
}

export default function NewVersionForm({
  settings = {},
  exampleLink,
  parentName,
  mustSelectStarter = false,
  possibleStarterIds = [],
  versionLabels = [],
  sessionTags = [],
}: NewVersionFormProps) {
  const [bounce, setBounce] = useState(null);
  const [formStems, setFormStems] = useState([]);
  const [stemErrors, setStemErrors] = useState({});
  const [name, setName] = useState("");
  const [bpm, setBpm] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceVersion, setSourceVersion] = useState("");
  const [catModels, setCatModels] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState("");

  const onGenerateName = () => {
    setName("Generated Name");
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create version", {
      bounce,
      formStems,
      name,
      bpm,
      notes,
      sourceVersion,
      catModels,
    });
  };

  const encodeTag = (category: string, option: string) => {
    return `${category}:${option}`;
  };

  return (
    <form className="new-version-form" onSubmit={onCreate}>
      {/* Upload Area */}
      <div className="uploads">
        <div className="bounce">
          <h6 className="label">
            <span>Bounce</span>
            <Tooltip>
              <p className="title">Bounce</p>
              <p>{settings.bounce_tooltip || "Tooltip text"}</p>
            </Tooltip>
          </h6>

          {/* @ts-ignore - ignoring prop types for now as SingleTrackUpload props are placeholders */}
          <SingleTrackUpload value={bounce} onChange={setBounce} />
        </div>

        <div className="stems">
          <h6 className="label">
            <span>Stems</span>
            <Tooltip>
              <p className="title">Bounce</p>
              <p>{settings.stems_tooltip || "Tooltip text"}</p>
            </Tooltip>

            {exampleLink && (
              <a href={exampleLink} download>
                Download Example Stems
              </a>
            )}
          </h6>

          {/* @ts-ignore - ignoring prop types for now as MultiTrackUpload props are placeholders */}
          <MultiTrackUpload value={formStems} errors={stemErrors} onChange={setFormStems} />
        </div>
      </div>

      <div className="additional-fields">
        {/* Text Fields */}
        <div className="text-fields">
          <div className="field">
            <div className="label-wrap">
              <label htmlFor="name">Session Name</label>
              {!parentName && (
                <button onClick={onGenerateName} type="button">
                  Name It For Me!
                </button>
              )}
            </div>
            <input
              id="name"
              className="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Old Skool"
              required
              disabled={!!parentName}
            />
          </div>

          <div className="field">
            <label htmlFor="bpm">BPM</label>
            <input
              id="bpm"
              className="bpm-input"
              type="number"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="ex. 175"
              min="1"
              required
            />
          </div>

          <div className="field two-col">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              className="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your notes here..."
            />
          </div>
        </div>

        {/* Tag Selection */}
        <div className="tag-selection">
          {/* Versions */}
          {mustSelectStarter && (
            <div className="tag-wrap">
              <h6>
                <span>Version Used</span>
                <Tooltip>
                  <p className="title">Versions</p>
                  <p>{settings.versions_tooltip || "Tooltip text"}</p>
                </Tooltip>
              </h6>

              <div className="version-selection">
                <h6>{parentName} Versions</h6>
                <TagGroup
                  name="version"
                  values={possibleStarterIds}
                  labels={versionLabels}
                  inputType="radio"
                  value={sourceVersion}
                  onChange={setSourceVersion}
                />
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="tag-wrap">
            <h6>Categories</h6>

            <div className="category-selection">
              {sessionTags.map((cat, i) => (
                <div key={i}>
                  <h6>{cat.name}</h6>
                  {cat.name && cat.options?.length && (
                    <TagGroup
                      name={cat.name}
                      values={cat.options.map((v) => encodeTag(cat.name, v))}
                      labels={cat.options}
                      value={catModels[i]}
                      onChange={(val) => setCatModels((prev: any) => ({ ...prev, [i]: val }))}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="error-message">
          <p>{errorMsg || "\u00A0"}</p>
        </div>
      </div>
    </form>
  );
}
