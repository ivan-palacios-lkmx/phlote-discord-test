"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const HeaderTranslateValueContext = createContext<number>(0);

const HeaderTranslateSetterContext = createContext<((value: number) => void) | null>(null);

interface HeaderTranslateProviderProps {
  children: ReactNode;
}

export function HeaderTranslateProvider({ children }: HeaderTranslateProviderProps) {
  const [headerTranslate, setHeaderTranslateState] = useState(0);
  const lastValueRef = useRef(0);

  const setHeaderTranslate = useCallback((value: number) => {
    if (Math.abs(value - lastValueRef.current) > 0.5) {
      lastValueRef.current = value;
      setHeaderTranslateState(value);
    }
  }, []);

  const setterValue = useMemo(() => setHeaderTranslate, [setHeaderTranslate]);

  return (
    <HeaderTranslateValueContext.Provider value={headerTranslate}>
      <HeaderTranslateSetterContext.Provider value={setterValue}>
        {children}
      </HeaderTranslateSetterContext.Provider>
    </HeaderTranslateValueContext.Provider>
  );
}

export function useHeaderTranslate() {
  return useContext(HeaderTranslateValueContext);
}
export function useSetHeaderTranslate() {
  const setter = useContext(HeaderTranslateSetterContext);
  if (!setter) {
    throw new Error("useSetHeaderTranslate must be used within a HeaderTranslateProvider");
  }
  return setter;
}
