import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";
import { OpenPanelComponent } from '@openpanel/nextjs';
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import SideAdBillboards from "@/components/layout/SideAdBillboards";
import { ExternalLinkTracker } from "@/components/tracking/ExternalLinkTracker";

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
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
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
  alternates: {
    canonical: SITE_URL,
  },
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
          <AnnouncementBanner />
          <SideAdBillboards />
          <ExternalLinkTracker />
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
        />
      </body>
    </html>
  );
}
