import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launches: Apps Built with Claude",
  description:
    "Explore apps launched by Claude community builders. Meet the makers, read their product descriptions and share feedback, or submit your own app.",
  alternates: { canonical: "/launches" },
  openGraph: {
    title: "Launches: Apps Built with Claude",
    description:
      "Explore apps launched by Claude community builders. Meet the makers and share feedback on their products.",
    url: "/launches",
  },
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
