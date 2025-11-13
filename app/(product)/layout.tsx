import OnlyMembers from "@/components/OnlyMembers/OnlyMembers";
import OverlayProfileWrapper from "@/components/OverlayProfile/OverlayProfileWrapper";
import PrismicioProvider from "@/components/PrismicioProvider";
import Footer from "@/components/site/footer/Footer";
import ProductHeader from "@/components/site/header/ProductHeader/ProductHeader";
import { createClient } from "@/prismicio";

import "./layout.scss";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <PrismicioProvider settings={settings.data}>
      <ProductHeader />
      <main className="page">
        <OnlyMembers>{children}</OnlyMembers>
      </main>

      <Footer />

      <OverlayProfileWrapper />
    </PrismicioProvider>
  );
}
