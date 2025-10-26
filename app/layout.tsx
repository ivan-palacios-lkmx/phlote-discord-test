import LenisProvider from "@/components/LenisProvider";
import PrivyProviderWrapper from "@/components/PrivyProviderWrapper";
import Footer from "@/components/site/footer/Footer";
import Header from "@/components/site/header/Header";
import { PrismicPreview } from "@prismicio/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { createClient } from "../prismicio";
import { repositoryName } from "../prismicio";
import "./globals.css";

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
  const client = createClient();
  const settings = await client.getSingle("settings");

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PrivyProviderWrapper appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}>
          <LenisProvider>
            <div className="container default grid min-h-screen w-full max-w-none grid-rows-[1fr_auto]">
              <Header settings={settings.data} />

              <main className="min-w-0 noise-background relative ">{children}</main>

              <Footer settings={settings.data} />
            </div>
          </LenisProvider>
        </PrivyProviderWrapper>

        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
