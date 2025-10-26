import Footer from "@/components/site/footer/Footer";
import ProductHeader from "@/components/site/header/ProductHeader";
import { createClient } from "@/prismicio";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <>
      <ProductHeader settings={settings.data} />
      <main className="min-w-0 noise-background relative">{children}</main>
      <Footer settings={settings.data} />
    </>
  );
}
