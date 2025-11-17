"use client";

import ProgressiveMedia from "@/components/Prismic/ProgressiveMedia/ProgressiveMedia";
import { usePrismicio } from "@/components/PrismicioProvider";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import CopyButton from "@/components/slices/landing/Directory/CopyButton";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import type { AlgoliaAddress } from "@/types/database";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import "./Member.scss";

interface MemberProps {
  member: AlgoliaAddress;
  activeFilters?: ActiveFilter[];
  style?: React.CSSProperties;
}

interface ActiveFilter {
  slug: string;
  value: string;
  name: string;
}

export default function Member({ member, activeFilters: activeFilters, style }: MemberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Tags - TODO: Implement useFbGlobals and useTags hooks
  // const { settingsDoc } = useFbGlobals();
  // const { decodeTag } = useTags();
  const tags: string[] = [];
  if (member?.isAdmin) tags.push("Admin");
  else if (member?.isCreator) tags.push("Creator");
  // TODO: Add tag decoding logic

  // Contact info - Firebase commented out
  // const contactDocRef =
  //   isPublic && member.objectID ? doc(db, `addresses/${member.objectID}/private/contact`) : null;
  // const contactDoc = useClientDoc(contactDocRef);

  // Placeholder values until Firebase is enabled
  // const contactDoc = null;
  // const twitterHandle = undefined; // contactDoc?.twitterHandle as string | undefined;
  const twitterLink = undefined; // twitterHandle ? `https://x.com/${twitterHandle.replace(/^@/, "")}` : undefined;

  // Create member link
  const linkTo =
    member.isPublic && member.objectID
      ? {
          pathname,
          query: {
            ...Object.fromEntries(searchParams.entries()),
            profile: member.objectID,
          },
        }
      : null;

  // TODO: Get settings for default_user_image
  const { settings } = usePrismicio();
  const defaultUserImage = settings.default_user_image;

  return (
    <div
      ref={containerRef}
      className={`directory-member ${member.isPublic ? "public" : ""} ${isIntersected ? "visible" : ""}`}>
      {linkTo ? (
        <Link
          href={{ pathname: linkTo.pathname, query: linkTo.query }}
          className="member-link block w-full uppercase">
          {/* Image */}
          {member.isPublic && member.objectID ? (
            <Web3Avatar
              avatar={
                member.ens?.avatar ||
                member.openSea?.profileImageURL ||
                member.zora?.profileImageURL ||
                ""
              }
            />
          ) : defaultUserImage ? (
            <div className="prismic-image">
              <ProgressiveMedia field={defaultUserImage} />
            </div>
          ) : null}

          {/* Title */}
          <h6
            className={`${!member.isPublic ? "opacity-50" : ""}`}
            dangerouslySetInnerHTML={{ __html: member?.title || "&nbsp;" }}
          />

          {/* Name */}
          <h3 className={`${!member.isPublic ? "opacity-50" : ""}`}>
            {member.title ? (
              <span>{member.title}</span>
            ) : member.isPublic && member.objectID ? (
              <Web3Username username={member.username || ""} />
            ) : (
              <span>Hidden Member</span>
            )}
          </h3>

          {/* Tags */}
          {member.isPublic && tags.length > 0 && (
            <div className="tag-wrap">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ) : (
        <div className="member-link block w-full uppercase">
          {/* Image */}
          {member.isPublic && member.objectID ? (
            <Web3Avatar
              avatar={
                member.ens?.avatar ||
                member.openSea?.profileImageURL ||
                member.zora?.profileImageURL ||
                ""
              }
            />
          ) : defaultUserImage ? (
            <div className="prismic-image">
              <ProgressiveMedia field={defaultUserImage as never} />
            </div>
          ) : null}

          {/* Title */}
          <h6
            className={`${!member.isPublic ? "opacity-50" : ""}`}
            dangerouslySetInnerHTML={{ __html: member?.title || "&nbsp;" }}
          />

          {/* Name */}
          <h3 className={`${!member.isPublic ? "opacity-50" : ""}`}>
            {member.title ? (
              <span>{member.title}</span>
            ) : member.isPublic && member.objectID ? (
              <Web3Username
                username={
                  member.ens?.name || member.openSea?.osUsername || member.zora?.zoraUsername || ""
                }
              />
            ) : (
              <span>Hidden Member</span>
            )}
          </h3>

          {/* Tags */}
          {member.isPublic && tags.length > 0 && (
            <div className="tag-wrap">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact */}
      <div className="link-wrap">
        {member.discordHandle && <CopyButton copyText={member.discordHandle}>Discord</CopyButton>}
        {twitterLink && <ADiv href={twitterLink}>Twitter</ADiv>}
        {member.email && <ADiv href={`mailto:${member.email}`}>Email</ADiv>}
      </div>
    </div>
  );
}
