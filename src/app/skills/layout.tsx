import type { Metadata } from "next";

const TITLE = "Claude Skills Directory: Browse Claude Code Skills";
const DESCRIPTION =
  "Find Claude Code skills for coding, research, testing, productivity and more. Browse community-built skills and install reusable Claude workflows.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/skills" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/skills" },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
