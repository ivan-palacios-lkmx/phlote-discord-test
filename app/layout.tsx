import AuthProvider from "@/components/AuthProvider";
import LenisProvider from "@/components/LenisProvider";
import PrivyProviderWrapper from "@/components/PrivyProviderWrapper";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { createClient } from "@/prismicio";
import { repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./assets/scss/_base.scss";
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
        <ReactQueryProvider>
          <PrivyProviderWrapper appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}>
            <AuthProvider>
              <LenisProvider>
                <DefaultLayout settings={settings.data}>{children}</DefaultLayout>
              </LenisProvider>
            </AuthProvider>
          </PrivyProviderWrapper>
        </ReactQueryProvider>

        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
