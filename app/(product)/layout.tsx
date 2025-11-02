import Footer from "@/components/site/footer/Footer";
import ProductHeader from "@/components/site/header/ProductHeader";
import PrismicioProvider from "@/components/PrismicioProvider";
import { createClient } from "@/prismicio";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <PrismicioProvider settings={settings.data}>
      <ProductHeader />
      <main className="min-w-0 noise-background relative">{children}</main>
      <Footer />
    </PrismicioProvider>
  );
}
