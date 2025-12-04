"use client";

import Contact from "@/components/OverlayProfile/Contact/Contact";
import Contributed from "@/components/OverlayProfile/Contributed/Contributed";
import Created from "@/components/OverlayProfile/Created/Created";
import EditContact from "@/components/OverlayProfile/EditContact/EditContact";
import SessionsLink from "@/components/OverlayProfile/SessionsLink/SessionsLink";
import Vanity from "@/components/OverlayProfile/Vanity/Vanity";
import CloseIcon from "@/components/icons/Close";
import { useUpdatePrivateAddress } from "@/hooks/query/mutations/use-update-private-address";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetAddressPrivateInfo } from "@/hooks/query/query-hooks/use-get-address-private-info";
import { ContactDocWithID } from "@/types/database";
import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import "./OverlayProfile.scss";

function OverlayProfileContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);
  const [profileID, setProfileID] = useState<string | null>(null);
  const { user } = usePrivy();

  const isCurrentSesion =
    profileID && profileID.toLowerCase() === user?.wallet?.address?.toLowerCase();
  const { data: addressInfo } = useGetAddressInfo(profileID!, !!profileID);

  const shouldIncludePrivateInfo: boolean = !!(addressInfo?.isPublic || isCurrentSesion);
  const { mutate: updatePrivateAddress } = useUpdatePrivateAddress();
  const { data: addressPrivateInfo } = useGetAddressPrivateInfo(
    profileID!,
    shouldIncludePrivateInfo,
  );

  // Get profileID from query params
  useEffect(() => {
    const routeProfile = searchParams.get("profile");
    if (routeProfile) {
      setProfileID(routeProfile);
    } else {
      setProfileID(null);
    }
  }, [searchParams]);

  // Handle modal close
  const onClose = useCallback(() => {
    setProfileID(null);
    const current = new URLSearchParams(searchParams.toString());
    current.delete("profile");
    const newSearch = current.toString();
    router.push(`${pathname}${newSearch ? `?${newSearch}` : ""}`);
  }, [searchParams, pathname, router]);

  // Click outside handler
  useEffect(() => {
    if (!modalRef.current || !profileID) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileID, onClose]);

  // Escape key handler
  useEffect(() => {
    if (!profileID) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileID, onClose]);

  const prevPathnameRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname && profileID) {
      // Pathname changed, close the modal
      setProfileID(null);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, profileID]);

  function setContact(contact: ContactDocWithID) {
    console.log(contact.email);
    const formContactInfoWithAnotherFields = {
      id: profileID!,
      name: contact.name ?? null,
      twitterHandle: contact.twitterHandle ?? null,
      email: contact.email?.trim() || null,
      discordUserID: contact.discordUserID ?? null,
      discordHandle: contact.discordHandle ?? null,
      dmChannel: contact.dmChannel ?? null,
    };
    updatePrivateAddress({ address: profileID!, contact: formContactInfoWithAnotherFields });
    if (!profileID) return;
  }
  if (!profileID) return null;

  return (
    <div className={`overlay-profile ${isCurrentSesion ? "current" : ""}`} data-lenis-prevent>
      <div className="profile-modal" ref={modalRef}>
        <button type="button" onClick={onClose} className="close-modal">
          <CloseIcon className="svg-close" />
        </button>

        <Vanity address={profileID} />

        {isCurrentSesion ? (
          <div className="current-user">
            {shouldIncludePrivateInfo && (
              <EditContact
                name={addressPrivateInfo?.name as string | undefined}
                discordHandle={addressPrivateInfo?.discordHandle as string | undefined}
                twitterHandle={addressPrivateInfo?.twitterHandle as string | undefined}
                email={addressPrivateInfo?.email as string | undefined}
                onSubmit={(data) => setContact({ ...data, id: profileID! })}
              />
            )}
            <SessionsLink profileID={profileID} onClose={onClose} />
          </div>
        ) : (
          <div className="other-user">
            {shouldIncludePrivateInfo && (
              <Contact
                discordHandle={addressPrivateInfo?.discordHandle as string | undefined}
                twitterHandle={addressPrivateInfo?.twitterHandle as string | undefined}
                email={addressPrivateInfo?.email as string | undefined}
              />
            )}
            <Created address={profileID} />
            <Contributed address={profileID} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function OverlayProfile() {
  return (
    <Suspense fallback={null}>
      <OverlayProfileContent />
    </Suspense>
  );
}
