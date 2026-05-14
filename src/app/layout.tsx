import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";
import { OpenPanelComponent } from '@openpanel/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ClaudeAI Directory — Skills, MCP Servers, Prompts & AI Jobs",
    template: "%s | ClaudeAI Directory",
  },
  description:
    "The community directory for Claude AI. Discover MCP servers, skills, prompts, AI jobs, and resources to build with Claude.",
  keywords: [
    "Claude AI",
    "MCP servers",
    "Model Context Protocol",
    "Claude skills",
    "AI prompts",
    "Claude Code",
    "AI tools",
    "AI jobs",
    "Anthropic",
  ],
  authors: [{ name: "ClaudeAI Directory" }],
  creator: "ClaudeAI Directory",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ClaudeAI Directory",
    title: "ClaudeAI Directory — Skills, MCP Servers, Prompts & AI Jobs",
    description:
      "The community directory for Claude AI. Discover MCP servers, skills, prompts, AI jobs, and resources to build with Claude.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClaudeAI Directory — Skills, MCP Servers, Prompts & AI Jobs",
    description:
      "The community directory for Claude AI. Discover MCP servers, skills, prompts, AI jobs, and resources.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>{children}</Providers>

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
