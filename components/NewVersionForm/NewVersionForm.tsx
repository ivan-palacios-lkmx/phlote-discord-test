"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input";
import { Textarea } from "@/components/Form/Textarea";
import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import SingleTrackUpload from "@/components/SingleTrackUpload/SingleTrackUpload";
import TagGroup from "@/components/TagGroup/TagGroup";
import Tooltip from "@/components/Tooltip/Tooltip";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import React, { useState } from "react";
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

function NewVersionFormContent({
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
  const { setValue, watch } = useFormContext<z.infer<typeof newVersionFormSchema>>();
  const [bounce, setBounce] = useState(null);

  const sourceVersion = watch("sourceVersion");
  const catModels = watch("catModels") || {};

  function onGenerateName() {
    const generatedName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: " ",
      style: "capital",
    });

    setValue("name", generatedName);
  }

  const encodeTag = (category: string, option: string) => {
    return `${category}:${option}`;
  };

  return (
    <>
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

          {/* @ts-expect-error - ignoring prop types for now as SingleTrackUpload props are placeholders */}
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
                  name="version"
                  values={possibleStarterIds}
                  labels={versionLabels}
                  inputType="radio"
                  modelValue={sourceVersion || ""}
                  onChange={(val) => setValue("sourceVersion", typeof val === "string" ? val : "")}
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
                sessionTags?.map((cat, i) => (
                  <div key={i}>
                    <h6>{cat.name}</h6>
                    {cat.name && cat.options?.length && (
                      <TagGroup
                        name={cat.name}
                        values={cat.options.map((v) => encodeTag(cat.name, v))}
                        labels={cat.options}
                        modelValue={catModels[i]}
                        onChange={(val) => setValue("catModels", { ...catModels, [i]: val })}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NewVersionForm(props: NewVersionFormProps) {
  const handleSubmit = (formValues: z.infer<typeof newVersionFormSchema>) => {
    console.log("Create version", {
      ...formValues,
      bounce: null,
    });
  };

  return (
    <Form schema={newVersionFormSchema} handleSubmit={handleSubmit} className="new-version-form">
      <NewVersionFormContent {...props} />
    </Form>
  );
}
