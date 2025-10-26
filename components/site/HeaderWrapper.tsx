"use client";

import { usePathname } from "next/navigation";
import ProductHeader from "@/components/site/ProductHeader";
import MarketingHeader from "@/components/site/MarketingHeader";

interface HeaderProps {
  settings: {
    app_menu?: Array<{ name?: string; link?: string }>;
    home_copy?: string;
    main_menu?: Array<{ name?: string; link?: string }>;
  };
}

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();

  // MIGRATED: routeIsProduct logic - determine if current route is a product page
  // In the original Vue app, this checked if route.name was NOT 'index' or 'slug'
  // In Next.js, we'll check if the pathname is NOT the home page or a slug page
  const shouldRenderProductHeader = !pathname || (pathname !== '/' && !pathname.startsWith('/slug'));

  return (
    <>
      {/* MIGRATED: Conditional header rendering based on route type */}
      {shouldRenderProductHeader ? (
        <ProductHeader settings={settings} />
      ) : (
        <MarketingHeader settings={settings} />
      )}
    </>
  );
}
