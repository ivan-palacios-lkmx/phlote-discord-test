import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "../prismicio";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "../prismicio";
import Footer from "@/components/site/footer/Footer";
import Header from "@/components/site/header/Header";
import LenisProvider from "@/components/LenisProvider";

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
    const title = (settings.data?.meta_title as string | null | undefined) ?? "Phlote.xyz";
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
      title: "Phlote.xyz",
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
        <LenisProvider>
          <div className="container default grid min-h-screen w-full max-w-none grid-rows-[1fr_auto]">
            {/* MIGRATED: Conditional header rendering - ProductHeader for product pages, MarketingHeader for marketing pages */}
            <Header settings={settings.data} />

            {/* MIGRATED: Page Content section */}
            <main className="min-w-0">
              {children}
            </main>

            {/* MIGRATED: Footer section - Conditional rendering based on route type */}
            <Footer settings={settings.data} />

            {/* MIGRATED: Mobile Menu - TODO: Add site-mobile-menu component */}
            {/* <site-mobile-menu /> */}

            {/* MIGRATED: Overlay Sign In - TODO: Add overlay-signature component */}
            {/* <overlay-signature /> */}

            {/* MIGRATED: Overlay User Profile - TODO: Add overlay-profile component */}
            {/* <overlay-profile /> */}
          </div>
        </LenisProvider>

        {/* Preview toolbar & auto-refresh during draft previews */}
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
