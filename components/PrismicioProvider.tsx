"use client";

import { type PrismicSettings } from "@/types/client";
import { type ReactNode, createContext, useContext } from "react";

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
