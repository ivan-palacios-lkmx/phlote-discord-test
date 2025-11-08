import PrismicioProvider from "@/components/PrismicioProvider";
import MarketingFooter from "@/components/site/footer/MarketingFooter/MarketingFooter";
import MarketingHeader from "@/components/site/header/MarketingHeader";
import { createClient } from "@/prismicio";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <PrismicioProvider settings={settings.data}>
      <MarketingHeader />
      <main className="min-w-0 noise-background relative">{children}</main>
      <MarketingFooter />
    </PrismicioProvider>
  );
}
