import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "../prismicio";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "../prismicio";
import MarketingFooter from "@/components/slices/landing/MarketingFooter";
import Header from "@/components/site/Header";

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
          {/* MIGRATED: Conditional header rendering - ProductHeader for product pages, MarketingHeader for marketing pages */}
          <Header settings={settings.data} />

          {/* MIGRATED: Page Content section */}
          <main className="min-w-0">
            {children}
          </main>

          {/* MIGRATED: Footer section - currently only MarketingFooter, TODO: Add conditional ProductFooter */}
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

          {/* MIGRATED: Mobile Menu - TODO: Add site-mobile-menu component */}
          {/* <site-mobile-menu /> */}

          {/* MIGRATED: Overlay Sign In - TODO: Add overlay-signature component */}
          {/* <overlay-signature /> */}

          {/* MIGRATED: Overlay User Profile - TODO: Add overlay-profile component */}
          {/* <overlay-profile /> */}
        </div>

        {/* Preview toolbar & auto-refresh during draft previews */}
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
