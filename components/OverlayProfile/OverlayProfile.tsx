"use client";

import Contact from "@/components/OverlayProfile/Contact/Contact";
import Contributed from "@/components/OverlayProfile/Contributed/Contributed";
import Created from "@/components/OverlayProfile/Created/Created";
import EditContact from "@/components/OverlayProfile/EditContact/EditContact";
import SessionsLink from "@/components/OverlayProfile/SessionsLink/SessionsLink";
import Vanity from "@/components/OverlayProfile/Vanity/Vanity";
import CloseIcon from "@/components/svg/close.svg";
import { useClientDoc } from "@/hooks/useClientDoc";
import { useFbAuth } from "@/hooks/useFbAuth";
import { db } from "@/lib/firebase";
import type { AddressDoc } from "@/types/client";
import { usePrivy } from "@privy-io/react-auth";
import { doc, setDoc } from "firebase/firestore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./OverlayProfile.scss";

export default function OverlayProfile() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);
  const [profileID, setProfileID] = useState<string | null>(null);

  // Get connected address from Privy
  const { user, authenticated } = usePrivy();
  const connectedAddress = useMemo(() => {
    if (!user || !authenticated) return null;
    const wallet = user.linkedAccounts?.find((acc) => acc.type === "wallet");
    return wallet && "address" in wallet ? (wallet.address as string) : null;
  }, [user, authenticated]);

  // Get Firebase Auth user
  const { user: fbUser } = useFbAuth();
  const firebaseUID = useMemo(() => {
    return fbUser?.value?.uid || null;
  }, [fbUser]);

  // Get profileID from query params
  useEffect(() => {
    const routeProfile = searchParams.get("profile");
    if (routeProfile) {
      setProfileID(routeProfile);
    } else {
      setProfileID(null);
    }
  }, [searchParams]);

  // Member document reference
  const memberRef = useMemo(
    () => (profileID ? doc(db, `addresses/${profileID}`) : null),
    [profileID],
  );

  const memberDoc = useClientDoc(memberRef) as AddressDoc | null;

  // Check if profile is public or user is member
  const isPublic = useMemo(() => {
    // TODO: Check if memberDoc has isPublic field and if userDoc is member
    // For now, assume public if memberDoc exists
    return !!memberDoc;
  }, [memberDoc]);

  // Profile contacts reference
  const profileContactsRef = useMemo(() => {
    if (!profileID || !isPublic) return null;
    return doc(db, `addresses/${profileID}/private/contact`);
  }, [profileID, isPublic]);

  const contactDoc = useClientDoc(profileContactsRef);

  // Check if address is current user
  const isCurrent = useMemo(() => {
    return (
      profileID &&
      (profileID.toLowerCase() === connectedAddress?.toLowerCase() ||
        profileID.toLowerCase() === firebaseUID?.toLowerCase())
    );
  }, [profileID, connectedAddress, firebaseUID]);

  // Set contact handler
  const setContact = async (contact: {
    name: string;
    discordHandle: string;
    twitterHandle: string;
    email: string;
  }) => {
    if (!profileContactsRef) return;
    await setDoc(profileContactsRef, contact, { merge: true });
  };

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

  // Close if route changes (pathname changes) - but preserve query params
  // We use a ref to track the previous pathname to avoid closing on initial mount
  const prevPathnameRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname && profileID) {
      // Pathname changed, close the modal
      setProfileID(null);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, profileID]);

  if (!profileID) return null;

  return (
    <div className={`overlay-profile ${isCurrent ? "current" : ""}`} data-lenis-prevent>
      <div className="profile-modal" ref={modalRef}>
        <button type="button" onClick={onClose} className="close-modal">
          <CloseIcon className="svg-close" />
        </button>

        <Vanity address={profileID} name={contactDoc?.name as string | undefined} />

        {/* Logged in user */}
        {isCurrent ? (
          <div className="current-user">
            {contactDoc && (
              <EditContact
                name={contactDoc.name as string | undefined}
                discordHandle={contactDoc.discordHandle as string | undefined}
                twitterHandle={contactDoc.twitterHandle as string | undefined}
                email={contactDoc.email as string | undefined}
                onSubmit={setContact}
              />
            )}
            <SessionsLink profileID={profileID} onClose={onClose} />
          </div>
        ) : (
          /* Other user */
          <div className="other-user">
            {isPublic && contactDoc && (
              <Contact
                discordHandle={contactDoc.discordHandle as string | undefined}
                twitterHandle={contactDoc.twitterHandle as string | undefined}
                email={contactDoc.email as string | undefined}
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
