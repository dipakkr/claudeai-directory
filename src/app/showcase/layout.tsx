import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude App Showcase: Claude AI Community",
  description:
    "Discover verified apps built by Claude AI community members, submit your app, and get practical feedback from builders.",
  alternates: { canonical: "/showcase" },
  openGraph: {
    title: "Claude App Showcase: Claude AI Community",
    description:
      "Discover verified apps built by Claude AI community members.",
    url: "/showcase",
  },
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
