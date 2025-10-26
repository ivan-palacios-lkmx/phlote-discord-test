import Footer from "@/components/site/footer/Footer";
import MarketingHeader from "@/components/site/header/MarketingHeader";
import { createClient } from "@/prismicio";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <>
      <MarketingHeader settings={settings.data} />
      <main className="min-w-0 noise-background relative">{children}</main>
      <Footer settings={settings.data} />
    </>
  );
}
