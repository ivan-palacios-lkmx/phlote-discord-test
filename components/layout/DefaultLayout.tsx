"use client";

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
import { useEffect, useMemo, useState } from "react";

interface DefaultLayoutProps {
  children: React.ReactNode;
  settings: PrismicSettings;
}

export default function DefaultLayout({ children, settings }: DefaultLayoutProps) {
  const { refreshUser } = useUser();
  const pathname = usePathname();
  const lenis = useLenis();
  const [fontsLoaded, setFontsLoaded] = useState(false);
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

  // Check if route is admin
  // Admin routes: routes in app/(admin) - "/admin", "/admin/members", etc.
  const routeIsAdmin = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/admin");
  }, [pathname]);

  // Check if route is marketing (not product)
  // Marketing routes: routes in app/(marketing) - "/" and dynamic routes
  // Product routes: routes in app/(product) - "/sessions", "/product", etc.
  const routeIsMarketing = useMemo(() => {
    if (!pathname) return false;
    // Product routes (known routes in app/(product))
    const productRoutes = ["/sessions", "/product"];
    const isProductRoute = productRoutes.some((route) => pathname.startsWith(route));
    // If it's not a product route and not an admin route, it's a marketing route
    return !isProductRoute && !routeIsAdmin;
  }, [pathname, routeIsAdmin]);

  // Get route name for class
  const routeName = useMemo(() => {
    if (!pathname) return "";
    if (pathname === "/") return "index";
    if (pathname.startsWith("/slug")) return "slug";
    return kebabCase(pathname.replace("/", ""));
  }, [pathname]);

  // Fonts loading detection
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      if (document.fonts.check("12px Authentic")) {
        setFontsLoaded(true);
      } else {
        document.fonts.ready.then(() => {
          setFontsLoaded(true);
        });
      }
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (!lenis?.current) return;

    const scrollToTop = () => {
      lenis.current?.scrollTo("top", {
        offset: 0,
        duration: 0,
        easing: (t: number) => t,
        immediate: true,
      });
    };

    scrollToTop();
  }, [pathname, lenis]);

  const classes = useMemo(() => {
    return ["default", "container", fontsLoaded ? "fonts-loaded" : "fonts-loading", routeName]
      .filter(Boolean)
      .join(" ");
  }, [fontsLoaded, routeName]);

  return (
    <PrismicioProvider settings={settings}>
      <HeaderTranslateProvider>
        <MenuOpenProvider>
          <div className={classes}>
            {/* Header */}
            {!routeIsAdmin && (routeIsMarketing ? <MarketingHeader /> : <ProductHeader />)}

            {/* Page */}
            {children}

            {/* Footer */}
            {!routeIsAdmin && (routeIsMarketing ? <MarketingFooter /> : <ProductFooter />)}

            {/* Mobile Menu */}
            {!routeIsAdmin && <MobileMenu />}

            {/* Overlay User Profile */}
            {!routeIsAdmin && <OverlayProfileWrapper />}
          </div>
        </MenuOpenProvider>
      </HeaderTranslateProvider>
    </PrismicioProvider>
  );
}
