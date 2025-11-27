"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input";
import { Textarea } from "@/components/Form/Textarea";
import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useCreateCreatorApplication } from "@/hooks/query/mutations/use-create-creator-application";
import type { ApplicationFormSlice } from "@/types/client";
import { applicationFormSchema } from "@/utils/zod-schemas";
import type { SliceComponentProps } from "@prismicio/react";
import { useMemo, useState } from "react";
import { z } from "zod";

import "./ApplicationForm.scss";

export default function ApplicationForm({
  slice: _slice, // eslint-disable-line @typescript-eslint/no-unused-vars
}: SliceComponentProps<ApplicationFormSlice>) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [info, setInfo] = useState("");
  const [workLink, setWorkLink] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [multiTrackUploadHasFiles, setMultiTrackUploadHasFiles] = useState(false);
  const [multiTrackUploadHasError, setMultiTrackUploadHasError] = useState(false);
  const {
    mutate: createCreatorApplication,
    error: createCreatorApplicationError,
    isPending: isCreatingCreatorApplication,
    isSuccess: isCreatorApplicationCreated,
  } = useCreateCreatorApplication();

  const canSubmit = useMemo(
    () =>
      firstName &&
      lastName &&
      email &&
      city &&
      ethAddress &&
      multiTrackUploadHasFiles &&
      !multiTrackUploadHasError,
    [
      firstName,
      lastName,
      email,
      city,
      ethAddress,
      multiTrackUploadHasFiles,
      multiTrackUploadHasError,
    ],
  );

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
        {/* Left Fields */}
        <div className="left">
          <label>
            <span>First Name*</span>
            <Input
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              type="text"
              maxLength={100}
              required
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label>
            <span>Email Address*</span>
            <Input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              maxLength={100}
              required
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label>
            <span>City*</span>
            <Input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Los Angeles"
              type="text"
              maxLength={100}
              required
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label className="info">
            <span>Additional Information</span>
            <Textarea
              name="info"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              id="info"
              maxLength={500}
              disabled={isCreatorApplicationCreated}
            />
          </label>
        </div>

        {/* Right Fields */}
        <div className="right">
          <label>
            <span>Link to Your Work</span>
            <Input
              name="workLink"
              value={workLink}
              onChange={(e) => setWorkLink(e.target.value)}
              placeholder="https://my-portfolio.com"
              type="url"
              maxLength={100}
              disabled={isCreatorApplicationCreated}
            />
          </label>

          <label>
            <span>Wallet Address / ENS*</span>
            <Input
              name="ethAddress"
              value={ethAddress}
              onChange={(e) => setEthAddress(e.target.value)}
              placeholder="phlote.eth"
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
          <button className="btn" type="submit" disabled={!canSubmit}>
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
