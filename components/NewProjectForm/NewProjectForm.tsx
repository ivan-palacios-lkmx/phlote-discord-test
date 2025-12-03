"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input/Input";
import { Textarea } from "@/components/Form/Textarea";
import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import { usePrismicio } from "@/components/PrismicioProvider";
import SingleTrackUpload from "@/components/SingleTrackUpload/SingleTrackUpload";
import TagGroup from "@/components/TagGroup/TagGroup";
import Tooltip from "@/components/Tooltip/Tooltip";
import VersionFormButton from "@/components/VersionFormButton/VersionFormButton";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useCreateSession } from "@/hooks/query/mutations/use-create-session";
import { useCreateVersion } from "@/hooks/query/mutations/use-create-version";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetSession } from "@/hooks/query/query-hooks/use-get-session";
import { useGetTags } from "@/hooks/query/query-hooks/use-get-tags";
import { useGetVersion } from "@/hooks/query/query-hooks/use-get-version";
import { useAudioValidationReady } from "@/hooks/use-audio-validation-ready";
import { SessionDoc, VersionDoc } from "@/types/database";
import { newVersionFormSchema } from "@/utils/zod-schemas";
import { PrismicRichText } from "@prismicio/react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import { z } from "zod";

import "./NewProjectForm.scss";

interface NewProjectFormProps {
  type: "version" | "session";
  sessionID?: string;
  versionID?: string;
  exampleLink?: string;
  parentName?: string;
  possibleStarterIds?: string[];
  versionLabels?: string[];
  sessionTags?: { name: string; options: string[] }[];
}

export default function NewProjectForm({
  type = "version",
  sessionID,
  exampleLink,
  parentName,
  possibleStarterIds = [],
  versionLabels = [],
  versionID,
}: NewProjectFormProps) {
  const {
    data: sessionTags,
    isLoading: isLoadingSessionTags,
    isError: isErrorSessionTags,
  } = useGetTags({
    category: "session",
  });

  const { data: session } = useGetSession(sessionID || "", !!sessionID);
  const { data: version } = useGetVersion(versionID || "", !!versionID);
  const router = useRouter();
  const { mutate: createVersion, isPending: isPendingCreateVersion } = useCreateVersion();
  const { data: creatorInfo } = useGetAddressInfo(
    session?.creator || "",
    type === "version" && !!sessionID,
  );

  const [generatedName, setGeneratedName] = useState("");

  function generateName() {
    const generatedName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: " ",
      style: "capital",
    });

    setGeneratedName(generatedName);
  }

  function FormContent() {
    const { control } = useFormContext();

    const { allFilesProcessed, isProcessing, isAudioValid, isValidating, bounceHash } =
      useAudioValidationReady();

    const formValues = useWatch({ control });

    function isFormTotallyFilled() {
      const name = formValues.name;
      const bpm = formValues.bpm;

      const hasName = name !== "" && name !== null && name !== undefined;
      const hasBpm =
        bpm !== "" && bpm !== null && bpm !== undefined && !isNaN(Number(bpm)) && Number(bpm) > 0;

      const hasBounce = !!bounceHash;

      const hasValidAudio =
        hasBounce &&
        ((!allFilesProcessed && !isProcessing) ||
          (allFilesProcessed && isAudioValid && !isValidating));

      return hasName && hasBpm && hasValidAudio;
    }

    return (
      <>
        <div className="title-area">
          <div className="entry">
            <PrismicRichText
              field={type === "version" ? settings.new_version_copy : settings.new_session_copy}
            />
          </div>

          <VersionFormButton
            type="submit"
            loading={isPending || isPendingCreateVersion || isProcessing || isValidating}
            disabled={!isFormTotallyFilled() || isProcessing || !bounceHash}>
            {type === "version" ? "Create New Version" : "Create Session"}
          </VersionFormButton>
        </div>
        {type === "version" && (
          <div className="session-info">
            <div className="artwork">
              <Web3Avatar avatar={creatorInfo?.avatar || ""} />
            </div>

            <div className="title-wrap">
              <SessionDetailTitle session={session as SessionDoc} version={version as VersionDoc} />
            </div>
          </div>
        )}
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
                  <label htmlFor="name">
                    {type === "version" ? "Version Name" : "Session Name"}
                  </label>
                  {!parentName && (
                    <button onClick={generateName} type="button">
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
                  resetValue={generatedName}
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
              {type === "version" && (
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
                            name={`versionTags.${i}`}
                            values={Category.options.map((option) =>
                              encodeTag(Category.name, option),
                            )}
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
      </>
    );
  }

  const { user } = usePrivy();

  const { mutate: createSession, isPending } = useCreateSession();

  const { settings } = usePrismicio();

  function encodeTag(categoryName: string, option: string) {
    return `${categoryName}:${option}`;
  }

  function handleSubmit(formValues: z.infer<typeof newVersionFormSchema>) {
    if (type === "version") {
      createVersion({ sessionId: sessionID || "", formValues });
      router.push(`/sessions/${sessionID}/versions/${version?.id}`);
      return;
    }
    createSession({ creator: user?.wallet?.address || "", formValues });
    router.push(`/sessions/${session?.id}`);
  }

  return (
    <Form schema={newVersionFormSchema} handleSubmit={handleSubmit}>
      <FormContent />
    </Form>
  );
}
