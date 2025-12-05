"use client";

import AvatarStack from "@/components/AvatarStack/AvatarStack";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useDownloadAudio } from "@/hooks/useDownloadAudio";
import { SessionDocWithID, VersionDocWithID } from "@/types/database";
import { usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

interface SessionDetailMetaProps {
  session?: SessionDocWithID;
  version?: VersionDocWithID;
}

export default function SessionDetailMeta({ session, version }: SessionDetailMetaProps) {
  const { user, authenticated } = usePrivy();

  const { downloadAudio, progress, isDownloading } = useDownloadAudio();

  const { data: accountInfo } = useGetAddressInfo(
    user?.wallet?.address || "",
    !!user?.wallet?.address && authenticated,
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
        <div className="stats-title">({`V_${String(version?.versionIndex).padStart(3, "0")}`})</div>
        <div className="stats-row">
          <span>({version?.downloadCount || 0}) Downloads</span>
        </div>
        <div className="stats-row">
          <span>({version?.playCount || 0}) Plays</span>
        </div>
        {session?.versionCount && (
          <div className="stats-row">
            <span>({session.versionCount}) Versions</span>
          </div>
        )}
      </div>

      {/* Stems */}
      <div className="session-stems">
        <div className="stems-title">({version?.stems?.length || 0}) Stems</div>
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
        <div className="collaborators-title">
          ({version?.collaborators?.length || 0}) Collaborators
        </div>
        <div key={version?.id} className="collaborator-avatars fade-enter-active">
          <AvatarStack addresses={version?.collaborators || []} isLink />
        </div>
      </div>

      {/* Discord */}
      {accountInfo?.isCreator && (
        <div className="session-discord">
          <div className="discord-title">({session?.discordMessageCount || 0}) Messages</div>
          {discordLink && (
            <ADiv href={discordLink} className="join-conversation button btn">
              Join the Conversation
            </ADiv>
          )}
        </div>
      )}
    </div>
  );
}
