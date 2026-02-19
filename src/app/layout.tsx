import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Claude Directory — Skills, MCP Servers, Prompts & AI Jobs",
    template: "%s | Claude Directory",
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
  authors: [{ name: "Claude Directory" }],
  creator: "Claude Directory",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Claude Directory",
    title: "Claude Directory — Skills, MCP Servers, Prompts & AI Jobs",
    description:
      "The community directory for Claude AI. Discover MCP servers, skills, prompts, AI jobs, and resources to build with Claude.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Directory — Skills, MCP Servers, Prompts & AI Jobs",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
