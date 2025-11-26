"use client";

import AvatarStack from "@/components/AvatarStack/AvatarStack";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import { useGetVersionAudio } from "@/hooks/query/mutations/use-get-version-audio";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useDownloadAudio } from "@/hooks/useDownloadAudio";
import { useFbEndpoints } from "@/hooks/useFbEndpoints";
import { Version } from "@/types/client";
import { Session } from "@/types/client";
import { usePrivy } from "@privy-io/react-auth";
import { useMemo, useState } from "react";

import "./SessionDetailMeta.scss";

interface SessionDetailMetaProps {
  session?: Session;
  version?: Version;
}

export default function SessionDetailMeta({ session, version }: SessionDetailMetaProps) {
  const { user, authenticated } = usePrivy();

  const { downloadAudio, progress, error, isDownloading } = useDownloadAudio();
  // Get wallet address

  // Get account info to check if user is creator
  const { data: accountInfo } = useGetAddressInfo(
    user?.wallet?.address || "",
    !!user?.wallet?.address && authenticated,
  );

  const isCreator = useMemo(() => {
    if (!authenticated || !accountInfo) return false;
    const isCreator = accountInfo.isAdmin || accountInfo.isCreator;
    return isCreator;
  }, [authenticated, accountInfo]);

  const versionIndex = useMemo(() => {
    const index = version?.versionIndex || 0;
    return `V_${String(index).padStart(3, "0")}`;
  }, [version?.versionIndex]);

  const playCount = useMemo(() => (version?.playCount as number) || 0, [version?.playCount]);
  const downloadCount = useMemo(
    () => (version?.downloadCount as number) || 0,
    [version?.downloadCount],
  );
  const stemCount = useMemo(() => {
    const stems = version?.stems;
    return Array.isArray(stems) ? stems.length : 0;
  }, [version?.stems]);
  const collaborators = useMemo(() => {
    const collabs = version?.collaborators;
    return Array.isArray(collabs) ? collabs : [];
  }, [version?.collaborators]);
  const collabCount = useMemo(() => collaborators.length, [collaborators]);
  const messageCount = useMemo(
    () => (session?.discordMessageCount as number) || 0,
    [session?.discordMessageCount],
  );

  const discordGuildID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || "";
  const discordLink = useMemo(() => {
    const channel = session?.discordChannel;
    if (channel && discordGuildID) {
      return `https://discord.com/channels/${discordGuildID}/${channel}`;
    }
    return "";
  }, [session?.discordChannel, discordGuildID]);


    return (
      <div className="session-detail-meta">
        {/* Stats */}
        <div className="session-stats">
          <div className="stats-title">({versionIndex})</div>
          <div className="stats-row">
            <span>({downloadCount}) Downloads</span>
          </div>
          <div className="stats-row">
            <span>({playCount}) Plays</span>
          </div>
          {session?.versionCount && (
            <div className="stats-row">
              <span>({session.versionCount}) Versions</span>
            </div>
          )}
        </div>

        {/* Stems */}
        <div className="session-stems">
          <div className="stems-title">({stemCount}) Stems</div>
          <button onClick={() => downloadAudio(version?.id || "")} className="download-stems btn">
            <span>Download Stems</span>
            {isDownloading && (
              <div className="download-progress fade-enter-active">
                <div className="prog-bar">
                  <span className="p" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Collaborators */}
        <div className="session-collaborators">
          <div className="collaborators-title">({collabCount}) Collaborators</div>
          <div key={versionIndex} className="collaborator-avatars fade-enter-active">
            <AvatarStack addresses={collaborators} isLink />
          </div>
        </div>

        {/* Discord */}
        {isCreator && (
          <div className="session-discord">
            <div className="discord-title">({messageCount}) Messages</div>
            {discordLink && (
              <ADiv href={discordLink} className="join-conversation button btn">
                Join the Conversation
              </ADiv>
            )}
          </div>
        )}
      </div>
    );
