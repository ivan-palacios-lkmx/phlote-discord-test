"use client";

import MarketingFooter from "@/components/site/footer/MarketingFooter";
import ProductFooter from "@/components/site/footer/ProductFooter";
import { usePathname } from "next/navigation";

interface FooterProps {
  settings: {
    app_menu?: Array<{ name?: string; link?: string }>;
    home_copy?: string;
    main_menu?: Array<{ name?: string; link?: string }>;
    social_menu?: Array<{ name?: string; link?: string }>;
  };
}

export default function Footer({ settings }: FooterProps) {
  const pathname = usePathname();

  // MIGRATED: routeIsProduct logic - determine if current route is a product page
  // In the original Vue app, this checked if route.name was NOT 'index' or 'slug'
  // In Next.js, we'll check if the pathname is NOT the home page or a slug page
  const shouldRenderProductFooter =
    !pathname || (pathname !== "/" && !pathname.startsWith("/slug"));

  return (
    <>
      {/* MIGRATED: Conditional footer rendering based on route type */}
      {shouldRenderProductFooter ? (
        <ProductFooter settings={settings} />
      ) : (
        <MarketingFooter
          slice={
            {
              primary: settings,
              slice_type: "marketing_footer",
              id: "footer",
              items: [],
            } as never
          }
          index={0}
          slices={[]}
          context={{}}
        />
      )}
    </>
  );
}
