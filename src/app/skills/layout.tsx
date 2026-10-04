import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Claude Skills Directory: Browse Claude Code Skills";
const DESCRIPTION =
  "Find Claude Code skills for coding, research, testing, productivity and more. Browse community-built skills and install reusable Claude workflows.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/skills" },
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: "/skills" },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
