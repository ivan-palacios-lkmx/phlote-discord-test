// Page styles
import "@/app/(admin)/admin/members/Members.scss";
import "@/app/(admin)/admin/page.scss";
import "@/app/(admin)/admin/sessions/Sessions.scss";
// Marketing layout
import "@/app/(marketing)/layout.scss";
import "@/app/(product)/connect-discord/connect-discord.scss";
import "@/app/(product)/creator-applications/page.scss";
import "@/app/(product)/sessions/[sessionID]/new/page.scss";
import "@/app/(product)/sessions/[sessionID]/sessionId.scss";
import "@/app/(product)/sessions/new/page.scss";
import AuthProvider from "@/components/AuthProvider";
import LenisProvider from "@/components/LenisProvider";
// Form components
import "@/components/MultiTrackUpload/MultiTrackUpload.scss";
import "@/components/NewProjectForm/NewProjectForm.scss";
import "@/components/Prismic/ProgressiveMedia/ProgressiveMedia.scss";
import PrivyProviderWrapper from "@/components/PrivyProviderWrapper";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import "@/components/SingleTrackUpload/SingleTrackUpload.scss";
import "@/components/TagGroup/TagGroup.scss";
// Player components
import "@/components/VersionPlayer/VersionPlayer.scss";
import DefaultLayout from "@/components/layout/DefaultLayout";
// Session detail components
import "@/components/session/SessionBreadcrumb/SessionBreadcrumb.scss";
import "@/components/session/SessionDetailActivity/SessionDetailActivity.scss";
import "@/components/session/SessionDetailActivityRow/SessionDetailActivityRow.scss";
import "@/components/session/SessionDetailMeta/SessionDetailMeta.scss";
import "@/components/session/SessionDetailNewVersion/SessionDetailNewVersion.scss";
import "@/components/session/SessionDetailPlayer/SessionDetailPlayer.scss";
import "@/components/session/SessionDetailTitle/SessionDetailTitle.scss";
import "@/components/session/SessionDetailVersions/SessionDetailVersions.scss";
import "@/components/session/SessionDetailVersionsRow/SessionDetailVersionsRow.scss";
import "@/components/site/footer/MarketingFooter/MarketingFooter.scss";
import "@/components/site/footer/NewsletterForm/NewsletterForm.scss";
import "@/components/site/header/ConnectWallet/ConnectWallet.scss";
// Marketing components
import "@/components/site/header/MarketingHeader/MarketingHeader.scss";
import "@/components/slices/landing/ApplicationForm/ApplicationForm.scss";
import "@/components/slices/landing/Directory/ADiv/ADiv.scss";
import "@/components/slices/landing/Directory/Directory/FilterButton/FilterButton.scss";
import "@/components/slices/landing/Directory/Directory/FilterCategoryGroup/FilterCategoryGroup.scss";
import "@/components/slices/landing/Directory/Directory/FilterCategoryRow/FilterCategoryRow.scss";
import "@/components/slices/landing/Directory/Directory/FilterMenu/FilterMenu.scss";
import "@/components/slices/landing/Directory/Directory/FilterTagGroup/FilterTagGroup.scss";
import "@/components/slices/landing/Directory/Directory/FilterTagRow/FilterTagRow.scss";
import "@/components/slices/landing/Directory/Directory/Index/Index.scss";
import "@/components/slices/landing/Directory/Directory/Member/Member.scss";
import "@/components/slices/landing/Directory/Directory/SortMenu/SortMenu.scss";
// Landing slices
import "@/components/slices/landing/Hero/Hero.scss";
import "@/components/slices/landing/HeroSlideShow/HeroSlideShow.scss";
import "@/components/slices/landing/HeroSlideShowButton/HeroSlideShowButton.scss";
import "@/components/slices/landing/HeroTrackPreview/HeroTrackPreview.scss";
import "@/components/slices/landing/ReleaseBlock/ReleaseBlock.scss";
import "@/components/slices/landing/ReleaseCarousel/ReleaseCarousel.scss";
import "@/components/slices/landing/SliceContent/SliceContent.scss";
import "@/components/slices/landing/StemsPlayer/Index/Index.scss";
import "@/components/slices/landing/StemsPlayer/Slice/Slice.scss";
// Web3 components
import "@/components/web3/Web3Avatar/Web3Avatar.scss";
import { createClient } from "@/prismicio";
import { repositoryName } from "@/prismicio";
import type { PrismicSettings } from "@/types/client";
import { PrismicPreview } from "@prismicio/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Base styles
import "./assets/scss/_base.scss";
import "./globals.css";
import "./layout.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
  adjustFontFallback: true,
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
  let settingsData = null;
  try {
    const client = createClient();
    const settings = await client.getSingle("settings");
    settingsData = settings.data;
  } catch (error) {
    console.warn("Failed to fetch Prismic settings during build:", error);
    // Continue with null settings - DefaultLayout should handle this gracefully
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryProvider>
          <PrivyProviderWrapper appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}>
            <AuthProvider>
              <LenisProvider>
                <DefaultLayout settings={settingsData || ({} as PrismicSettings)}>
                  {children}
                </DefaultLayout>
              </LenisProvider>
            </AuthProvider>
          </PrivyProviderWrapper>
        </ReactQueryProvider>

        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
