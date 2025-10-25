import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "../prismicio";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "../prismicio";
import MarketingFooter from "@/components/slices/landing/MarketingFooter";
import ProductHeader from "@/components/site/ProductHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  try {
    const settings = await client.getSingle("settings");
    const title = (settings.data?.meta_title as string | null | undefined) ?? "Site";
    const description = (settings.data?.meta_description as string | null | undefined) ?? "";
    const ogImageUrl = settings.data?.og_image?.url as string | undefined;
    return {
      title,
      description,
      openGraph: {
        images: ogImageUrl ? [ogImageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Site",
      description: "",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get settings for footer
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="container default grid min-h-screen grid-rows-[1fr_auto]">
          {/* Header */}
          {/* TODO: Add site-product-header and site-marketing-header conditionally */}
          <ProductHeader settings={settings.data} />

          {/* Page Content */}
          <main className="min-w-0">
            {children}
          </main>

          {/* Footer */}
          <MarketingFooter
            slice={{
              primary: settings.data,
              slice_type: 'marketing_footer',
              id: 'footer',
              items: []
            } as never}
            index={0}
            slices={[]}
            context={{}}
          />

          {/* Mobile Menu - TODO: Add site-mobile-menu component */}
          {/* <site-mobile-menu /> */}

          {/* Overlay Sign In - TODO: Add overlay-signature component */}
          {/* <overlay-signature /> */}

          {/* Overlay User Profile - TODO: Add overlay-profile component */}
          {/* <overlay-profile /> */}
        </div>

        {/* Preview toolbar & auto-refresh during draft previews */}
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
