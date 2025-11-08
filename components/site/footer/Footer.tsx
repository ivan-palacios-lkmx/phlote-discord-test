"use client";

import MarketingFooter from "@/components/site/footer/MarketingFooter/MarketingFooter";
import ProductFooter from "@/components/site/footer/ProductFooter";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const shouldRenderProductFooter =
    !pathname || (pathname !== "/" && !pathname.startsWith("/slug"));

  return <>{shouldRenderProductFooter ? <ProductFooter /> : <MarketingFooter />}</>;
}
