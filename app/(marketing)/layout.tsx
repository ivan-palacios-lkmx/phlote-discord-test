import OverlayProfileWrapper from "@/components/OverlayProfile/OverlayProfileWrapper";
import PrismicioProvider from "@/components/PrismicioProvider";
import MarketingFooter from "@/components/site/footer/MarketingFooter/MarketingFooter";
import MarketingHeader from "@/components/site/header/MarketingHeader/MarketingHeader";
import { createClient } from "@/prismicio";

import "./layout.scss";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <main className="front-page">{children}</main>;
}
