"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface PrismicSettings {
  app_menu?: Array<{ name?: string; link?: string }>;
  home_copy?: string;
  main_menu?: Array<{ name?: string; link?: string }>;
  social_menu?: Array<{ name?: string; link?: string }>;
  footer_copy?: unknown;
  secondary_menu?: Array<{ name?: string; link?: unknown }>;
  body?: unknown;
  meta_title?: string;
  meta_description?: string;
  og_image?: { url?: string };
}

interface PrismicioContextValue {
  settings: PrismicSettings;
}

const PrismicioContext = createContext<PrismicioContextValue | undefined>(undefined);

interface PrismicioProviderProps {
  children: ReactNode;
  settings: PrismicSettings;
}

export default function PrismicioProvider({ children, settings }: PrismicioProviderProps) {
  return <PrismicioContext.Provider value={{ settings }}>{children}</PrismicioContext.Provider>;
}

export function usePrismicio() {
  const context = useContext(PrismicioContext);
  if (context === undefined) {
    throw new Error("usePrismicio must be used within a PrismicioProvider");
  }
  return context;
}
