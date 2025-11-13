"use client";

import "@/app/layout.scss";
import OverlayProfileWrapper from "@/components/OverlayProfile/OverlayProfileWrapper";
import PrismicioProvider from "@/components/PrismicioProvider";
import OverlaySignature from "@/components/overlay/OverlaySignature/OverlaySignature";
import Footer from "@/components/site/footer/Footer";
import MarketingHeader from "@/components/site/header/MarketingHeader/MarketingHeader";
import ProductHeader from "@/components/site/header/ProductHeader/ProductHeader";
import MobileMenu from "@/components/site/mobile-menu/MobileMenu";
import { useLenis } from "@/hooks/useLenis";
import kebabCase from "lodash/kebabCase";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface DefaultLayoutProps {
  children: React.ReactNode;
  settings: any;
}

export default function DefaultLayout({ children, settings }: DefaultLayoutProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const headerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  // Check if route is product
  const routeIsProduct = useMemo(() => {
    return pathname && pathname !== "/" && !pathname.startsWith("/slug");
  }, [pathname]);

  // Get route name for class
  const routeName = useMemo(() => {
    if (!pathname) return "";
    if (pathname === "/") return "index";
    if (pathname.startsWith("/slug")) return "slug";
    return kebabCase(pathname.replace("/", ""));
  }, [pathname]);

  // Fonts loading detection
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      // Fallback if document.fonts is not available
      setTimeout(() => setFontsLoaded(true), 100);
    }
  }, []);

  // Mounted state
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Window height
  useEffect(() => {
    const updateHeight = () => {
      const height = window.innerHeight === Infinity ? window.innerHeight : window.innerHeight;
      setWindowHeight(height);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Header height
  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(headerRef.current);

    return () => resizeObserver.disconnect();
  }, [routeIsProduct]);

  // Scroll to top on route change
  useEffect(() => {
    if (!lenis?.current || !mounted) return;

    const scrollToTop = () => {
      lenis.current?.scrollTo("top", {
        offset: 0,
        duration: 0,
        easing: () => {},
        immediate: true,
      });
    };

    scrollToTop();
  }, [pathname, lenis, mounted]);

  const classes = useMemo(() => {
    return [
      "container",
      "default",
      fontsLoaded ? "fonts-loaded" : "fonts-loading",
      routeName,
      mounted ? "mounted" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [fontsLoaded, routeName, mounted]);

  const styles = useMemo(() => {
    if (!mounted) return {};
    const winHeight = windowHeight === Infinity ? "100vh" : `${windowHeight}px`;
    return {
      "--winHeight": winHeight,
      "--header-height": `${headerHeight}px`,
    } as React.CSSProperties;
  }, [mounted, windowHeight, headerHeight]);

  return (
    <PrismicioProvider settings={settings}>
      <div className={classes} style={styles}>
        {/* Header */}
        <div ref={headerRef as React.RefObject<HTMLDivElement>}>
          {routeIsProduct ? <ProductHeader /> : <MarketingHeader />}
        </div>

        {/* Page */}
        <main>{children}</main>

        {/* Footer */}
        <Footer />

        {/* Mobile Menu */}
        <MobileMenu />

        {/* Overlay Sign In */}
        <OverlaySignature />

        {/* Overlay User Profile */}
        <OverlayProfileWrapper />
      </div>
    </PrismicioProvider>
  );
}
