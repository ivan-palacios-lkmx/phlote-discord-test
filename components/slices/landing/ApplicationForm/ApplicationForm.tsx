"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import MultiTrackUpload from "@/components/slices/landing/MultiTrackUpload";
import { db } from "@/lib/firebase";
import type { ApplicationFormSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { addDoc, collection } from "firebase/firestore";
import { useMemo, useState } from "react";

import "./ApplicationForm.scss";

interface Track {
  id: string;
  name: string;
  file: File;
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
    () =>
      firstName &&
      lastName &&
      email &&
      city &&
      ethAddress &&
      tracks.length > 0 &&
      !hasErrors,
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

  return (
    <section className="slice-application-form contained">
      <form className={success ? "success" : ""} onSubmit={onSubmit}>
        {/* Left Fields */}
        <div className="left">
          <label>
            <span>First Name*</span>
            <input
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
            <input
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
            <input
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
            <input
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
            <textarea
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
            <input
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
            <input
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
            <MultiTrackUpload value={tracks} onChange={setTracks}>
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
      </form>
    </section>
  );
}
