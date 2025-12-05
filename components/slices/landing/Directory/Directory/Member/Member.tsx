"use client";

import { AddressClientService } from "@/app/client/services/address-client-service";
import ProgressiveMedia from "@/components/Prismic/ProgressiveMedia/ProgressiveMedia";
import { usePrismicio } from "@/components/PrismicioProvider";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import CopyButton from "@/components/slices/landing/Directory/CopyButton";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressPrivateInfo } from "@/hooks/query/query-hooks/use-get-address-private-info";
import useTags from "@/hooks/useTags";
import type { AddressDocWithID, AlgoliaAddress } from "@/types/database";
import { ImageField } from "@prismicio/client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";

interface MemberProps {
  address: AlgoliaAddress;
  activeFilters?: ActiveFilter[];
  style?: React.CSSProperties;
}

interface ActiveFilter {
  slug: string;
  value: string;
  name: string;
}

const Member = memo(function Member({ address, activeFilters: activeFilters, style }: MemberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: addressPrivateInfo } = useGetAddressPrivateInfo(address.objectID, address.isPublic);

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
  const { decodeTag } = useTags();
  const tags: string[] = address?.tags?.map((tag) => decodeTag(tag).value) || [];
  if (address?.isAdmin) tags.unshift("Admin");
  else if (address?.isCreator) tags.unshift("Creator");

  // Contact info - Firebase commented out
  // const contactDocRef =
  //   isPublic && member.objectID ? doc(db, `addresses/${member.objectID}/private/contact`) : null;
  // const contactDoc = useClientDoc(contactDocRef);

  // Placeholder values until Firebase is enabled
  // const contactDoc = null;
  // const twitterHandle = undefined; // contactDoc?.twitterHandle as string | undefined;

  const twitterLink = addressPrivateInfo?.twitterHandle
    ? `https://x.com/${addressPrivateInfo.twitterHandle.replace(/^@/, "")}`
    : undefined;

  // Create member link
  const linkTo =
    address.isPublic && address.objectID
      ? {
          pathname,
          query: {
            ...Object.fromEntries(searchParams.entries()),
            profile: address.objectID,
          },
        }
      : null;

  // TODO: Get settings for default_user_image
  const { settings } = usePrismicio();
  const defaultUserImage = settings.default_user_image;

  const username =
    addressPrivateInfo?.name ||
    AddressClientService.getAddressUsername(address as unknown as AddressDocWithID);
  return (
    <div
      ref={containerRef}
      className={`directory-member ${address.isPublic ? "public" : ""} ${isIntersected ? "visible" : ""}`}>
      {linkTo ? (
        <Link
          href={{ pathname: linkTo.pathname, query: linkTo.query }}
          className="member-link block w-full uppercase">
          {/* Image */}
          {address.isPublic && address.objectID ? (
            <Web3Avatar
              avatar={
                address.ens?.avatar ||
                address.openSea?.profileImageURL ||
                address.zora?.profileImageURL ||
                ""
              }
            />
          ) : defaultUserImage ? (
            <div className="prismic-image">
              <ProgressiveMedia field={defaultUserImage as ImageField} />
            </div>
          ) : null}

          {/* Title */}
          <h6
            className={`${!address.isPublic ? "opacity-50" : ""}`}
            dangerouslySetInnerHTML={{ __html: address?.title || "&nbsp;" }}
          />

          {/* Name */}
          <h3 className={`${!address.isPublic ? "opacity-50" : ""}`}>
            {address.title ? (
              <span>{address.title}</span>
            ) : address.isPublic && address.objectID && username ? (
              <Web3Username username={username} />
            ) : (
              <span>Hidden Member</span>
            )}
          </h3>

          {/* Tags */}
          {address.isPublic && tags.length > 0 && (
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
          {address.isPublic && address.objectID ? (
            <Web3Avatar
              avatar={
                address.ens?.avatar ||
                address.openSea?.profileImageURL ||
                address.zora?.profileImageURL ||
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
            className={`${!address.isPublic ? "opacity-50" : ""}`}
            dangerouslySetInnerHTML={{ __html: address?.title || "&nbsp;" }}
          />

          {/* Name */}
          <h3 className={`${!address.isPublic ? "opacity-50" : ""}`}>
            {address.title ? (
              <span>{address.title}</span>
            ) : address.isPublic && address.objectID && username ? (
              <Web3Username username={username} />
            ) : (
              <span>Hidden Member</span>
            )}
          </h3>

          {/* Tags */}
          {address.isPublic && tags.length > 0 && (
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
        {addressPrivateInfo?.discordHandle && (
          <CopyButton copyText={addressPrivateInfo.discordHandle}>Discord</CopyButton>
        )}
        {twitterLink && <ADiv href={twitterLink}>Twitter</ADiv>}
        {addressPrivateInfo?.email && (
          <ADiv href={`mailto:${addressPrivateInfo.email}`}>Email</ADiv>
        )}
      </div>
    </div>
  );
});

export default Member;
