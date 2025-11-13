"use client";

import OverlayProfile from "@/components/OverlayProfile/OverlayProfile";
import { usePrivy } from "@privy-io/react-auth";

export default function OverlayProfileWrapper() {
  const { ready, authenticated } = usePrivy();

  if (!ready || !authenticated) {
    return null;
  }

  return <OverlayProfile />;
}
