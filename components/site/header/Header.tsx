"use client";

import MarketingHeader from "@/components/site/header/MarketingHeader";
import ProductHeader from "@/components/site/header/ProductHeader";
import { usePathname } from "next/navigation";

interface HeaderProps {
  settings: {
    app_menu?: Array<{ name?: string; link?: string }>;
    home_copy?: string;
    main_menu?: Array<{ name?: string; link?: string }>;
  };
}

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isSlugPage = pathname !== "/" && !pathname.startsWith("/api") && !pathname.includes("/_");
  const shouldRenderProductHeader = !isHomePage && !isSlugPage;

  return (
    <>
      {shouldRenderProductHeader ? (
        <ProductHeader settings={settings} />
      ) : (
        <MarketingHeader settings={settings} />
      )}
    </>
  );
}
