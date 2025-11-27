"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input";
import { Textarea } from "@/components/Form/Textarea";
import MultiTrackUpload from "@/components/MultiTrackUpload/MultiTrackUpload";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { db } from "@/lib/firebase";
import type { ApplicationFormSlice } from "@/types/client";
import { applicationFormSchema } from "@/utils/zod-schemas";
import type { SliceComponentProps } from "@prismicio/react";
import { addDoc, collection } from "firebase/firestore";
import { useMemo, useState } from "react";
import { z } from "zod";

import "./ApplicationForm.scss";

interface Track {
  id: string;
  name: string;
  error?: string;
}

export default function ApplicationForm({
  slice: _slice, // eslint-disable-line @typescript-eslint/no-unused-vars
}: SliceComponentProps<ApplicationFormSlice>) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [info, setInfo] = useState("");
  const [workLink, setWorkLink] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);

  const hasErrors = useMemo(() => tracks.some((t) => !!t.error), [tracks]);

  const canSubmit = useMemo(
    () => firstName && lastName && email && city && ethAddress && tracks.length > 0 && !hasErrors,
    [firstName, lastName, email, city, ethAddress, tracks.length, hasErrors],
  );

  const applicationsRef = useMemo(() => collection(db, "applications"), []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      if (hasErrors) {
        throw new Error("Please resolve any errors in tracks");
      }

      if (!canSubmit) {
        throw new Error("Please fill out all required fields");
      }

      if (!tracks.length) {
        throw new Error("Please provide at least one example of your work");
      }

      const formData = {
        created: new Date(),
        firstName,
        lastName,
        email,
        city,
        info,
        workLink,
        ethAddress,
        tracks: tracks.map((t) => ({ name: t.name, id: t.id })),
      };

      await addDoc(applicationsRef, formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  function handleSubmit(formValues: z.infer<typeof applicationFormSchema>) {
    console.log(formValues);
  }
  return (
    <section className="slice-application-form contained">
      <Form
        schema={applicationFormSchema}
        handleSubmit={handleSubmit}
        className={success ? "success" : ""}>
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
              disabled={success}
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
              disabled={success}
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
              disabled={success}
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
              disabled={success}
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
              disabled={success}
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
              disabled={success}
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
              disabled={success}
            />
          </label>

          <div className="upload">
            <label>Upload Your Music*</label>
            <MultiTrackUpload name="tracks" value={tracks} onChange={setTracks}>
              <span>Drop Tracks (.wav or .mp3)</span>
            </MultiTrackUpload>
          </div>
        </div>

        <div className="button-row">
          <button className="btn" type="submit" disabled={!canSubmit}>
            {loading ? (
              <LoadingSpinnerIcon className="loading-spinner" />
            ) : success ? (
              <span>Thank You</span>
            ) : (
              <span>Submit</span>
            )}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </Form>
    </section>
  );
}
