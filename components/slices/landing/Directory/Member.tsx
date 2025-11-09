"use client";

// import { useClientDoc } from "@/hooks/useClientDoc";
// import { db } from "@/lib/firebase";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { PrismicImage } from "@prismicio/react";
// import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ADiv from "./ADiv/ADiv";
import CopyButton from "./CopyButton";

interface MemberProps {
  member: {
    objectID?: string;
    title?: string;
    isPublic?: boolean;
    isAdmin?: boolean;
    isCreator?: boolean;
    tags?: string[];
    [key: string]: unknown;
  };
}

export default function Member({ member }: MemberProps) {
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

  // Gating - TODO: Implement useFbAuth hook
  // Firebase Auth - Commented out
  // const { userDoc } = useFbAuth();
  // const userDoc = null as { isMember?: boolean } | null; // Placeholder
  const isPublic = member?.isPublic || false; // TODO: Add userDoc?.isMember when Firebase is enabled

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
  const name = undefined; // contactDoc?.name as string | undefined;
  const discordHandle = undefined; // contactDoc?.discordHandle as string | undefined;
  // const twitterHandle = undefined; // contactDoc?.twitterHandle as string | undefined;
  const twitterLink = undefined; // twitterHandle ? `https://x.com/${twitterHandle.replace(/^@/, "")}` : undefined;
  const email = undefined; // contactDoc?.email as string | undefined;

  // Create member link
  const linkTo =
    isPublic && member.objectID
      ? {
          pathname,
          query: {
            ...Object.fromEntries(searchParams.entries()),
            profile: member.objectID,
          },
        }
      : null;

  // TODO: Get settings for default_user_image
  // const settings = usePrisSettings();
  const defaultUserImage = null; // Placeholder

  return (
    <div
      ref={containerRef}
      className={`directory-member text-center transition-all duration-[400ms] ease-in-out ${
        isPublic ? "public" : ""
      } ${isIntersected ? "visible" : "opacity-0 translate-y-[100px]"}`}>
      {linkTo ? (
        <Link
          href={{ pathname: linkTo.pathname, query: linkTo.query }}
          className="member-link block w-full uppercase">
          {/* Image */}
          {isPublic && member.objectID ? (
            <Web3Avatar address={member.objectID} />
          ) : defaultUserImage ? (
            <div className="prismic-image rounded-full overflow-hidden mb-[30px]">
              <PrismicImage field={defaultUserImage as never} className="w-full h-full" />
            </div>
          ) : null}

          {/* Title */}
          <h6
            className={`m-0 font-condensed leading-[0.9] text-base ${!isPublic ? "opacity-50" : ""}`}
            dangerouslySetInnerHTML={{ __html: member?.title || "&nbsp;" }}
          />

          {/* Name */}
          <h3
            className={`my-[10px] tracking-[-0.03em] grid grid-cols-1 text-[30px] leading-[100%] ${!isPublic ? "opacity-50" : ""}`}>
            {name ? (
              <span>{name}</span>
            ) : isPublic && member.objectID ? (
              <Web3Username address={member.objectID} />
            ) : (
              <span>Hidden Member</span>
            )}
          </h3>

          {/* Tags */}
          {isPublic && tags.length > 0 && (
            <div className="tag-wrap flex justify-center flex-wrap gap-[5px] mt-5">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="mono transparent text-xs font-mono font-normal bg-transparent border border-black rounded-[7px] text-black py-[0.4em] px-4 box-border leading-none uppercase">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ) : (
        <div className="member-link block w-full uppercase">
          {/* Image */}
          {isPublic && member.objectID ? (
            <Web3Avatar address={member.objectID} />
          ) : defaultUserImage ? (
            <div className="prismic-image rounded-full overflow-hidden mb-[30px]">
              <PrismicImage field={defaultUserImage as never} className="w-full h-full" />
            </div>
          ) : null}

          {/* Title */}
          <h6
            className={`m-0 font-condensed leading-[0.9] text-base ${!isPublic ? "opacity-50" : ""}`}
            dangerouslySetInnerHTML={{ __html: member?.title || "&nbsp;" }}
          />

          {/* Name */}
          <h3
            className={`my-[10px] tracking-[-0.03em] grid grid-cols-1 text-[30px] leading-[100%] ${!isPublic ? "opacity-50" : ""}`}>
            {name ? (
              <span>{name}</span>
            ) : isPublic && member.objectID ? (
              <Web3Username address={member.objectID} />
            ) : (
              <span>Hidden Member</span>
            )}
          </h3>

          {/* Tags */}
          {isPublic && tags.length > 0 && (
            <div className="tag-wrap flex justify-center flex-wrap gap-[5px] mt-5">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="mono transparent text-xs font-mono font-normal bg-transparent border border-black rounded-[7px] text-black py-[0.4em] px-4 box-border leading-none uppercase">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact */}
      <div className="link-wrap flex justify-center flex-wrap gap-[5px] mt-[10px]">
        {discordHandle && <CopyButton copyText={discordHandle}>Discord</CopyButton>}
        {twitterLink && <ADiv href={twitterLink}>Twitter</ADiv>}
        {email && <ADiv href={`mailto:${email}`}>Email</ADiv>}
      </div>
    </div>
  );
}
