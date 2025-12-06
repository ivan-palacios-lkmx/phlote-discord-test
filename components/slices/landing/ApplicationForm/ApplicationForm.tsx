"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input/Input";
import { Textarea } from "@/components/Form/Textarea";
import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import { useCreateCreatorApplication } from "@/hooks/query/mutations/use-create-creator-application";
import type { ApplicationFormSlice } from "@/types/client";
import { applicationFormSchema } from "@/utils/zod-schemas";
import type { SliceComponentProps } from "@prismicio/react";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

interface ApplicationFormContentProps {
  isCreatingCreatorApplication: boolean;
  isCreatorApplicationCreated: boolean;
  createCreatorApplicationError: Error | null;
}

function ApplicationFormContent({
  isCreatingCreatorApplication,
  isCreatorApplicationCreated,
  createCreatorApplicationError,
}: ApplicationFormContentProps) {
  const { control } = useFormContext();
  const formValues = useWatch({ control });

  function isFormTotallyFilled(formValues: Record<string, unknown>) {
    const requiredFields = [
      formValues.firstName,
      formValues.lastName,
      formValues.email,
      formValues.city,
    ];
    const allFieldsFilled = requiredFields.every(
      (value) => value !== "" && value !== null && value !== undefined,
    );

    // Verificar que tracks existe, es un array y tiene al menos un elemento válido
    const tracks = formValues.tracks;
    const hasTracks =
      Array.isArray(tracks) &&
      tracks.length > 0 &&
      tracks.every(
        (track: unknown) =>
          typeof track === "object" &&
          track !== null &&
          "name" in track &&
          "id" in track &&
          typeof (track as { name: unknown; id: unknown }).name === "string" &&
          typeof (track as { name: unknown; id: unknown }).id === "string" &&
          (track as { name: string; id: string }).name.length > 0 &&
          (track as { name: string; id: string }).id.length > 0,
      );

    return allFieldsFilled && hasTracks;
  }

  return (
    <>
      <div className="left">
        <label>
          <span>First Name*</span>
          <Input
            name="firstName"
            placeholder="John"
            type="text"
            maxLength={100}
            required
            disabled={isCreatorApplicationCreated}
          />
        </label>

        <label>
          <span>Last Name*</span>
          <Input
            name="lastName"
            placeholder="Doe"
            type="text"
            maxLength={100}
            required
            disabled={isCreatorApplicationCreated}
          />
        </label>

        <label className="email-address">
          <span>Email Address*</span>
          <Input
            name="email"
            placeholder="name@example.com"
            type="email"
            maxLength={100}
            required
            disabled={isCreatorApplicationCreated}
          />
        </label>

        <label className="info">
          <span>Additional Information</span>
          <Textarea name="info" id="info" maxLength={500} disabled={isCreatorApplicationCreated} />
        </label>
      </div>

      <div className="right">
        <label>
          <span>Link to Your Work</span>
          <Input
            name="workLink"
            placeholder="https://my-portfolio.com"
            type="url"
            maxLength={100}
            disabled={isCreatorApplicationCreated}
          />
        </label>
        <label>
          <span>City*</span>
          <Input
            name="city"
            placeholder="Los Angeles"
            type="text"
            maxLength={100}
            required
            disabled={isCreatorApplicationCreated}
          />
        </label>
        <div className="upload">
          <label>Upload Your Music*</label>
          <MultiTrackUpload name="tracks" />
        </div>
      </div>

      <div className="button-row">
        <button className="btn" type="submit" disabled={!isFormTotallyFilled(formValues)}>
          {isCreatingCreatorApplication ? (
            <LoadingSpinnerIcon className="loading-spinner" />
          ) : isCreatorApplicationCreated ? (
            <span>Thank You</span>
          ) : (
            <span>Submit</span>
          )}
        </button>
        {createCreatorApplicationError && (
          <p className="error">{createCreatorApplicationError.message}</p>
        )}
      </div>
    </>
  );
}

export default function ApplicationForm({
  slice: _slice, // eslint-disable-line @typescript-eslint/no-unused-vars
}: SliceComponentProps<ApplicationFormSlice>) {
  const {
    mutate: createCreatorApplication,
    isPending: isCreatingCreatorApplication,
    isSuccess: isCreatorApplicationCreated,
    error: createCreatorApplicationError,
    reset: resetMutation,
  } = useCreateCreatorApplication();

  const resetFormRef = useRef<((values: Record<string, unknown>) => void) | null>(null);

  function handleSubmit(formValues: z.infer<typeof applicationFormSchema>) {
    createCreatorApplication({
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      city: formValues.city,
      info: formValues.info,
      tracks: formValues.tracks,
    });
  }

  return (
    <section className="slice-application-form contained">
      <Form
        schema={applicationFormSchema}
        handleSubmit={handleSubmit}
        className={isCreatorApplicationCreated ? "success" : ""}>
        <ApplicationFormContentWrapper
          resetFormRef={resetFormRef}
          isCreatingCreatorApplication={isCreatingCreatorApplication}
          isCreatorApplicationCreated={isCreatorApplicationCreated}
          createCreatorApplicationError={createCreatorApplicationError}
        />
      </Form>
    </section>
  );
}

function ApplicationFormContentWrapper({
  resetFormRef,
  isCreatingCreatorApplication,
  isCreatorApplicationCreated,
  createCreatorApplicationError,
}: {
  resetFormRef: React.MutableRefObject<((values: Record<string, unknown>) => void) | null>;
  isCreatingCreatorApplication: boolean;
  isCreatorApplicationCreated: boolean;
  createCreatorApplicationError: Error | null;
}) {
  const { reset } = useFormContext();

  useEffect(() => {
    resetFormRef.current = reset;
  }, [reset, resetFormRef]);

  return (
    <ApplicationFormContent
      isCreatingCreatorApplication={isCreatingCreatorApplication}
      isCreatorApplicationCreated={isCreatorApplicationCreated}
      createCreatorApplicationError={createCreatorApplicationError}
    />
  );
}
