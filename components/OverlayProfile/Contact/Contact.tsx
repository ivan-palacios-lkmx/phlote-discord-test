"use client";

import DiscordIcon from "@/components/svg/discord.svg";
import MailIcon from "@/components/svg/mail.svg";
import TwitterIcon from "@/components/svg/twitter.svg";
import { useMemo } from "react";

import "./Contact.scss";

interface ContactProps {
  discordHandle?: string;
  twitterHandle?: string;
  email?: string;
}

export default function Contact({ discordHandle, twitterHandle, email }: ContactProps) {
  const twitterLink = useMemo(() => {
    const formatted = twitterHandle?.replace(/^@/, "");
    return formatted ? `https://x.com/${formatted}` : null;
  }, [twitterHandle]);

  const emailLink = useMemo(() => {
    return email ? `mailto:${email}` : null;
  }, [email]);

  const hasAny = useMemo(() => {
    return !!(discordHandle || twitterHandle || email);
  }, [discordHandle, twitterHandle, email]);

  if (!hasAny) return null;

  return (
    <div className="overlay-profile-contact">
      {discordHandle && (
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(discordHandle)}
          className="social-link discord-btn">
          <DiscordIcon className="svg-social-discord" />
          <span>{discordHandle}</span>
        </button>
      )}

      {email && emailLink && (
        <a href={emailLink} className="social-link">
          <MailIcon className="svg-social-mail" />
          <span>{email}</span>
        </a>
      )}

      {twitterHandle && twitterLink && (
        <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="social-link">
          <TwitterIcon className="svg-social-twitter" />
          <span>{twitterHandle}</span>
        </a>
      )}
    </div>
  );
}
