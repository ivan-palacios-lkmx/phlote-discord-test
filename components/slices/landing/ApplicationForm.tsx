"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { db } from "@/lib/firebase";
import type { ApplicationFormSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { addDoc, collection } from "firebase/firestore";
import { useMemo, useState } from "react";

import MultiTrackUpload from "./MultiTrackUpload";

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

  return (
    <section className="slice-application-form mt-[100px] mb-[100px] max-w-[1600px] mx-auto relative z-10">
      <form onSubmit={onSubmit}>
        <div className={`grid grid-cols-2 gap-0 gap-x-[30px] ${success ? "success" : ""}`}>
          {/* Left Fields */}
          <div className="left grid grid-cols-2 gap-[30px] gap-y-[30px] gap-x-[15px]">
            <label>
              <span className="block text-[18px] leading-none font-semibold uppercase">
                First Name*
              </span>
              <Input
                variant="form"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                type="text"
                maxLength={100}
                required
                disabled={success}
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>

            <label>
              <span className="block text-[18px] leading-none font-semibold uppercase">
                Last Name*
              </span>
              <Input
                variant="form"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                type="text"
                maxLength={100}
                required
                disabled={success}
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>

            <label>
              <span className="block text-[18px] leading-none font-semibold uppercase">
                Email Address*
              </span>
              <Input
                variant="form"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                type="email"
                maxLength={100}
                required
                disabled={success}
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>

            <label>
              <span className="block text-[18px] leading-none font-semibold uppercase">City*</span>
              <Input
                variant="form"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Los Angeles"
                type="text"
                maxLength={100}
                required
                disabled={success}
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>

            <label className="info col-span-2">
              <span className="block text-[18px] leading-none font-semibold uppercase">
                Additional Information
              </span>
              <textarea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                id="info"
                maxLength={500}
                disabled={success}
                className="block w-full box-border border border-black/20 rounded-[10px] px-5 py-5 h-[150px] font-body resize-none uppercase mt-[15px] transition-colors focus:border-black disabled:opacity-50"
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>
          </div>

          {/* Right Fields */}
          <div className="right flex flex-col gap-[30px]">
            <label>
              <span className="block text-[18px] leading-none font-semibold uppercase">
                Link to Your Work
              </span>
              <Input
                variant="form"
                value={workLink}
                onChange={(e) => setWorkLink(e.target.value)}
                placeholder="https://my-portfolio.com"
                type="url"
                maxLength={100}
                disabled={success}
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>

            <label>
              <span className="block text-[18px] leading-none font-semibold uppercase">
                Wallet Address / ENS*
              </span>
              <Input
                variant="form"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                placeholder="phlote.eth"
                type="text"
                maxLength={100}
                required
                disabled={success}
                style={{ backgroundColor: "#ffffff" }}
              />
            </label>

            <div className="upload">
              <label className="block text-[18px] leading-none font-semibold uppercase">
                Upload Your Music*
              </label>
              <MultiTrackUpload value={tracks} onChange={setTracks}>
                <span>Drop Tracks (.wav or .mp3)</span>
              </MultiTrackUpload>
            </div>
          </div>
        </div>

        <div className="w-[270px] mx-auto mt-[150px] relative">
          <Button
            variant="btn"
            className="px-[15px] w-full box-border text-[26px]"
            type="submit"
            disabled={!canSubmit || loading}>
            {loading ? (
              <LoadingSpinnerIcon className="h-[1em] w-[1em] mx-auto" />
            ) : success ? (
              <span>Thank You</span>
            ) : (
              <span>Submit</span>
            )}
          </Button>
          {error && (
            <p className="error text-red-600 absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full mt-0">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
