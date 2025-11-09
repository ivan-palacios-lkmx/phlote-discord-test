import PrismicioProvider from "@/components/PrismicioProvider";
import MarketingFooter from "@/components/site/footer/MarketingFooter/MarketingFooter";
import MarketingHeader from "@/components/site/header/MarketingHeader/MarketingHeader";
import { createClient } from "@/prismicio";

import "./layout.scss";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <PrismicioProvider settings={settings.data}>
      <MarketingHeader />
      <main className="front-page">{children}</main>
      <MarketingFooter />
    </PrismicioProvider>
  );
}
