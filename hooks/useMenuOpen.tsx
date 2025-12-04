"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

const MenuOpenValueContext = createContext<boolean>(false);
const MenuOpenSetterContext = createContext<((value: boolean) => void) | null>(null);

interface MenuOpenProviderProps {
  children: ReactNode;
}

export function MenuOpenProvider({ children }: MenuOpenProviderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MenuOpenValueContext.Provider value={menuOpen}>
      <MenuOpenSetterContext.Provider value={setMenuOpen}>
        {children}
      </MenuOpenSetterContext.Provider>
    </MenuOpenValueContext.Provider>
  );
}

export function useMenuOpen() {
  const menuOpen = useContext(MenuOpenValueContext);
  const setMenuOpen = useContext(MenuOpenSetterContext);

  if (setMenuOpen === null) {
    throw new Error("useMenuOpen must be used within a MenuOpenProvider");
  }

  return { menuOpen, setMenuOpen };
}
