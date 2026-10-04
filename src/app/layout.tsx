import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";
import { OpenPanelComponent } from '@openpanel/nextjs';
import SideAdBillboards from "@/components/layout/SideAdBillboards";
import { ExternalLinkTracker } from "@/components/tracking/ExternalLinkTracker";
import { VisitBeacon } from "@/components/tracking/VisitBeacon";
import { ViewAsBanner } from "@/components/layout/ViewAsBanner";
import { LaunchImpressions } from "@/components/tracking/LaunchImpressions";
import { KeyClickTracker } from "@/components/tracking/KeyClickTracker";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif for page titles — the "Claude" half of the look.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";
const DEFAULT_TITLE = "Claude AI Directory: MCP Servers, Skills & Agents";
const DEFAULT_DESCRIPTION =
  "Find Claude MCP servers, Claude Code skills, agents and prompts. Browse install commands, setup guides and community resources for building with Claude.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Claude AI Directory",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Claude AI directory",
    "Claude directory",
    "Claude Skills",
    "Claude Code skills",
    "Claude MCP servers",
    "MCP servers for Claude",
    "MCP directory",
    "Claude Agents",
    "Claude Code Agents",
    "Claude Code",
  ],
  authors: [{ name: "ClaudeAI Directory" }],
  creator: "ClaudeAI Directory",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ClaudeAI Directory",
    images: [DEFAULT_OG_IMAGE],
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // No site-wide canonical here: a default would point every page without its
  // own canonical at the homepage. Each route sets `alternates.canonical`.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${sourceSerif.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          {/* Discord announcement banner paused; the component stays in components/layout/AnnouncementBanner.tsx. */}
          <ViewAsBanner />
          <SideAdBillboards />
          <ExternalLinkTracker />
          <VisitBeacon />
          <LaunchImpressions />
          {/* useSearchParams needs a Suspense boundary */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </Providers>

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-ZPWBYERBTY"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZPWBYERBTY');
          `}
        </Script>
        <OpenPanelComponent
          clientId="3c0fbc66-1ebf-4993-ae25-7598616931c5"
          apiUrl="https://analytics.tooljunction.io/api"
          trackScreenViews={true}
          trackAttributes={true}
        />
        <KeyClickTracker />
      </body>
    </html>
  );
}
