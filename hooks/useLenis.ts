"use client";

import Lenis from "lenis";
import { createContext, useContext } from "react";

const LenisContext = createContext<React.RefObject<Lenis | null> | null>(null);

export function useLenis() {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenis must be used within a LenisProvider");
  }
  return context;
}

export { LenisContext };
