"use client";

import ContactInput from "@/components/OverlayProfile/ContactInput/ContactInput";
import { type PrismicSettings, usePrismicio } from "@/components/PrismicioProvider";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import DiscordIcon from "@/components/svg/discord.svg";
import MailIcon from "@/components/svg/mail.svg";
import ProfileIcon from "@/components/svg/profile.svg";
import TwitterIcon from "@/components/svg/twitter.svg";
import { useEffect, useRef, useState } from "react";

import "./EditContact.scss";

interface EditContactProps {
  name?: string;
  discordHandle?: string;
  twitterHandle?: string;
  email?: string;
  onSubmit?: (data: {
    name: string;
    discordHandle: string;
    twitterHandle: string;
    email: string;
  }) => void;
}

export default function EditContact({
  name,
  discordHandle,
  twitterHandle,
  email,
  onSubmit,
}: EditContactProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { settings } = usePrismicio();
  const [nameInput, setNameInput] = useState("");
  const [discordInput, setDiscordInput] = useState("");
  const [twitterInput, setTwitterInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    if (name) setNameInput(name);
    if (discordHandle) setDiscordInput(discordHandle);
    if (twitterHandle) setTwitterInput(twitterHandle);
    if (email) setEmailInput(email);
  }, [name, discordHandle, twitterHandle, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      name: nameInput,
      discordHandle: discordInput,
      twitterHandle: twitterInput,
      email: emailInput,
    });
  };

  // Type assertion for discord_invite_link since it's not in the type yet
  const discordInviteLink = (settings as PrismicSettings & { discord_invite_link?: string })
    .discord_invite_link;

  return (
    <div className="overlay-profile-edit-contact">
      <form ref={formRef} onSubmit={handleSubmit}>
        <ContactInput value={nameInput} onChange={setNameInput} placeholder="Name">
          <ProfileIcon />
        </ContactInput>

        {/* Discord section - shows handle or join link */}
        <div className="discord">
          <DiscordIcon />
          {discordHandle ? (
            <span>{discordHandle}</span>
          ) : (
            <ADiv href={discordInviteLink} className="mono">
              Join Server
            </ADiv>
          )}
        </div>

        <ContactInput value={twitterInput} onChange={setTwitterInput} placeholder="Twitter">
          <TwitterIcon />
        </ContactInput>

        <ContactInput value={emailInput} onChange={setEmailInput} placeholder="Email">
          <MailIcon />
        </ContactInput>

        <button className="submit-button" type="submit" />
      </form>
    </div>
  );
}
