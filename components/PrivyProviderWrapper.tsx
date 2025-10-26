"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";

interface PrivyProviderWrapperProps {
  children: ReactNode;
  appId: string;
}

export default function PrivyProviderWrapper({ children, appId }: PrivyProviderWrapperProps) {
  return <PrivyProvider appId={appId}>{children}</PrivyProvider>;
}
