"use client";

import { usePathname } from "next/navigation";
import ProductHeader from "@/components/site/header/ProductHeader";
import MarketingHeader from "@/components/site/header/MarketingHeader";

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
  // In Next.js: Show MarketingHeader for home page ('/') and slug pages (dynamic routes)
  // Show ProductHeader for other specific routes (like /dashboard, /profile, etc.)
  const isHomePage = pathname === '/';
  const isSlugPage = pathname !== '/' && !pathname.startsWith('/api') && !pathname.includes('/_');
  const shouldRenderProductHeader = !isHomePage && !isSlugPage;

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
