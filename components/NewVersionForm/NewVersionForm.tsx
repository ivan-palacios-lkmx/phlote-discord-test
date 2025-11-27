"use client";

import { Input } from "@/components/Form/Input/Input";
import { Textarea } from "@/components/Form/Textarea";
import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import SingleTrackUpload from "@/components/SingleTrackUpload/SingleTrackUpload";
import TagGroup from "@/components/TagGroup/TagGroup";
import Tooltip from "@/components/Tooltip/Tooltip";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import React from "react";
import { useFormContext } from "react-hook-form";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import { z } from "zod";

import "./NewVersionForm.scss";

interface NewVersionFormProps {
  settings?: Record<string, string>;
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
}: NewVersionFormProps) {
  const {
    data: sessionTags,
    isLoading: isLoadingSessionTags,
    isError: isErrorSessionTags,
  } = useGetTags({
    category: "session",
  });
  const { setValue } = useFormContext<z.infer<typeof newVersionFormSchema>>();

  function onGenerateName() {
    const generatedName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: " ",
      style: "capital",
    });

    setValue("name", generatedName);
  }

  function encodeTag(categoryName: string, option: string) {
    return `${categoryName}:${option}`;
  }

  return (
    <div className="new-version-form">
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

          <SingleTrackUpload name="bounce" />
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

          <MultiTrackUpload name="stems" />
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
            <Input
              id="name"
              name="name"
              className="name-input"
              type="text"
              placeholder="ex. Old Skool"
              disabled={!!parentName}
            />
          </div>

          <div className="field">
            <label htmlFor="bpm">BPM</label>
            <Input
              id="bpm"
              name="bpm"
              className="bpm-input"
              type="number"
              placeholder="ex. 175"
              min="1"
            />
          </div>

          <div className="field two-col">
            <label htmlFor="notes">Notes</label>
            <Textarea
              id="notes"
              name="notes"
              className="notes-input"
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
                  name="sourceVersion"
                  values={possibleStarterIds}
                  labels={versionLabels}
                  inputType="radio"
                />
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="tag-wrap">
            <h6>Categories</h6>

            <div className="category-selection">
              {isLoadingSessionTags ? (
                <div>Loading...</div>
              ) : isErrorSessionTags ? (
                <div>Error loading session tags</div>
              ) : (
                sessionTags?.map((Category, i) => (
                  <div key={i}>
                    <h6>{Category.name}</h6>
                    {Category.name && Category.options?.length && (
                      <TagGroup
                        name={`catModels.${i}`}
                        values={Category.options.map((option) => encodeTag(Category.name, option))}
                        labels={Category.options}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
