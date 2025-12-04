"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import HamburgerIcon from "@/components/icons/HamburgerIcon/HamburgerIcon";
import WoodmarkIcon from "@/components/icons/Woodmark";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import { useMenuOpen } from "@/hooks/useMenuOpen";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import "./MobileMenu.scss";

export default function MobileMenu() {
  const { settings } = usePrismicio();
  const mainMenu = settings.main_menu || [];
  const { menuOpen, setMenuOpen } = useMenuOpen();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (menuOpen) {
      setShouldRender(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsEntering(true);
        });
      });
    } else {
      setIsEntering(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [menuOpen]);

  const handleToggle = (isOpen: boolean) => {
    setMenuOpen(isOpen);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`site-mobile-menu menu-transition ${isEntering ? "menu-enter-active" : "menu-leave-active"}`}>
      <div className="header">
        <WoodmarkIcon className="svg-wordmark" />
        <HamburgerIcon active={menuOpen} onToggle={handleToggle} />
      </div>

      <nav>
        {mainMenu.map((item, index) => (
          <ADiv
            key={index}
            href={item.link as string}
            className={`mono ${pathname === item.link ? "router-link-exact-active" : ""}`}>
            {item.name || "Link"}
          </ADiv>
        ))}
      </nav>
    </div>
  );
}
