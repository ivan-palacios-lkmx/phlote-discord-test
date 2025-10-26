import AuthProvider from "@/components/AuthProvider";
import LenisProvider from "@/components/LenisProvider";
import PrivyProviderWrapper from "@/components/PrivyProviderWrapper";
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PrivyProviderWrapper appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}>
          <AuthProvider>
            <LenisProvider>
              <div className="container default grid min-h-screen w-full max-w-none grid-rows-[1fr_auto]">
                {children}
              </div>
            </LenisProvider>
          </AuthProvider>
        </PrivyProviderWrapper>

        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
