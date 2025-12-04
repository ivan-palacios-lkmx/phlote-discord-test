"use client";

import "@/app/layout.scss";
import MobileMenu from "@/components/MobileMenu/MobileMenu";
import OverlayProfileWrapper from "@/components/OverlayProfile/OverlayProfileWrapper";
import PrismicioProvider from "@/components/PrismicioProvider";
import MarketingFooter from "@/components/site/footer/MarketingFooter/MarketingFooter";
import ProductFooter from "@/components/site/footer/ProductFooter/ProductFooter";
import MarketingHeader from "@/components/site/header/MarketingHeader/MarketingHeader";
import ProductHeader from "@/components/site/header/ProductHeader/ProductHeader";
import { useSyncAddress } from "@/hooks/query/query-hooks/use-sync-address";
import { HeaderTranslateProvider } from "@/hooks/useHeaderTranslate";
import { useLenis } from "@/hooks/useLenis";
import { MenuOpenProvider } from "@/hooks/useMenuOpen";
import { type PrismicSettings } from "@/types/client";
import { usePrivy, useUser } from "@privy-io/react-auth";
import kebabCase from "lodash/kebabCase";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface DefaultLayoutProps {
  children: React.ReactNode;
  settings: PrismicSettings;
}

export default function DefaultLayout({ children, settings }: DefaultLayoutProps) {
  const { refreshUser } = useUser();
  const pathname = usePathname();
  const lenis = useLenis();
  const headerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const { user, ready, authenticated } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const { data, isSuccess } = useSyncAddress({
    address: walletAddress || "",
    enabled: ready && authenticated && !!walletAddress,
  });

  useEffect(() => {
    if (isSuccess) {
      if (data?.syncStatus === "updated") {
        refreshUser();
      }
    }
  }, [data, refreshUser, isSuccess]);

  // Check if route is marketing (not product)
  // Marketing routes: routes in app/(marketing) - "/" and dynamic routes
  // Product routes: routes in app/(product) - "/sessions", "/product", etc.
  const routeIsMarketing = useMemo(() => {
    if (!pathname) return false;
    // Product routes (known routes in app/(product))
    const productRoutes = ["/sessions", "/product"];
    const isProductRoute = productRoutes.some((route) => pathname.startsWith(route));
    // If it's not a product route, it's a marketing route
    return !isProductRoute;
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
  }, [routeIsMarketing]);

  // Scroll to top on route change
  useEffect(() => {
    if (!lenis?.current || !mounted) return;

    const scrollToTop = () => {
      lenis.current?.scrollTo("top", {
        offset: 0,
        duration: 0,
        easing: (t: number) => t,
        immediate: true,
      });
    };

    scrollToTop();
  }, [pathname, lenis, mounted]);

  const classes = useMemo(() => {
    return [
      "default",
      "container",
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
      <HeaderTranslateProvider>
        <MenuOpenProvider>
          <div className={classes} style={styles}>
            {/* Header */}

            {routeIsMarketing ? <MarketingHeader /> : <ProductHeader />}

            {/* Page */}
            {children}

            {/* Footer */}
            {routeIsMarketing ? <MarketingFooter /> : <ProductFooter />}

            {/* Mobile Menu */}
            <MobileMenu />

            {/* Overlay User Profile */}
            <OverlayProfileWrapper />
          </div>
        </MenuOpenProvider>
      </HeaderTranslateProvider>
    </PrismicioProvider>
  );
}
