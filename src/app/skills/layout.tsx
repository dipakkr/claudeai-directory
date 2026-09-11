import type { Metadata } from "next";

const TITLE = "Claude Skills: Discover the Best Skills for Claude";
const DESCRIPTION =
  "Discover community-built Claude Skills for coding, research, testing, productivity and more. Explore trending Skills and install what you need.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/skills" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/skills" },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
