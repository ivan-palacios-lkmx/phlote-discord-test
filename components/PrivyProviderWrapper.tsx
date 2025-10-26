"use client";

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";

interface PrivyProviderWrapperProps {
  children: ReactNode;
  appId: string;
}
const privyConfiguration: PrivyClientConfig = {
  appearance: {
    logo: "/images/Phlotelogo.png",
    landingHeader: "CONNECT YOUR WALLET",
  },
};

export default function PrivyProviderWrapper({ children, appId }: PrivyProviderWrapperProps) {
  return (
    <PrivyProvider appId={appId} config={privyConfiguration}>
      {children}
    </PrivyProvider>
  );
}
