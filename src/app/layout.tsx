import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";
import { OpenPanelComponent } from '@openpanel/nextjs';
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Claude Directory: Skills, MCP Servers & Agents",
    template: "%s | Claude Directory",
  },
  description:
    "Discover community-built Claude Skills, MCP servers and Agents. Explore what is trending, install useful resources and publish what you build.",
  keywords: [
    "Claude Skills",
    "Claude MCP servers",
    "MCP servers for Claude",
    "Claude Agents",
    "Claude Code Agents",
    "Claude Code",
  ],
  authors: [{ name: "Claude Directory" }],
  creator: "Claude Directory",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Claude Directory",
    title: "Claude Directory: Skills, MCP Servers & Agents",
    description:
      "Discover community-built Claude Skills, MCP servers and Agents. Explore what is trending, install useful resources and publish what you build.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Directory: Skills, MCP Servers & Agents",
    description:
      "Discover community-built Claude Skills, MCP servers and Agents. Explore what is trending, install useful resources and publish what you build.",
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
