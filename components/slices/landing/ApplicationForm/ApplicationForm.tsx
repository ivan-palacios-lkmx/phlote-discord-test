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
import { useState } from "react";
import { z } from "zod";

import "./ApplicationForm.scss";

export default function ApplicationForm({
  slice: _slice, // eslint-disable-line @typescript-eslint/no-unused-vars
}: SliceComponentProps<ApplicationFormSlice>) {
  const {
    mutate: createCreatorApplication,
    error: createCreatorApplicationError,
    isPending: isCreatingCreatorApplication,
    isSuccess: isCreatorApplicationCreated,
  } = useCreateCreatorApplication();

  const [formValues, setFormValues] = useState<Record<string, unknown>>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    info: "",
    ethAddress: "",
    tracks: [],
    workLink: "",
  });

  function isFormTotallyFilled(formValues: Record<string, unknown>) {
    const requiredFields = [
      formValues.firstName,
      formValues.lastName,
      formValues.email,
      formValues.city,
      formValues.ethAddress,
    ];
    return requiredFields.every((value) => value !== "" && value !== null && value !== undefined);
  }

  function handleSubmit(formValues: z.infer<typeof applicationFormSchema>) {
    console.log(formValues);
    createCreatorApplication({
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      city: formValues.city,
      info: formValues.info,
      ethAddress: formValues.ethAddress,
      tracks: formValues.tracks,
    });
  }
  return (
    <section className="slice-application-form contained">
      <Form
        schema={applicationFormSchema}
        handleSubmit={handleSubmit}
        className={isCreatorApplicationCreated ? "success" : ""}>
        <div className="left">
          <label>
            <span>First Name*</span>
            <Input
              name="firstName"
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
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
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label>
            <span>Email Address*</span>
            <Input
              name="email"
              placeholder="name@example.com"
              type="email"
              maxLength={100}
              required
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
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
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
              required
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label className="info">
            <span>Additional Information</span>
            <Textarea
              name="info"
              id="info"
              maxLength={500}
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
              disabled={isCreatorApplicationCreated}
            />
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
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label>
            <span>Wallet Address / ENS*</span>
            <Input
              name="ethAddress"
              placeholder="phlote.eth"
              type="text"
              maxLength={100}
              required
              onWatch={(formValue) => setFormValues((prev) => ({ ...prev, ...formValue }))}
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
      </Form>
    </section>
  );
}
