import Link from "next/link";
import { Wrench, Server, FileText, Briefcase, Rocket, BookOpen, Calculator, MessageSquare, Newspaper } from "lucide-react";

const CategorySection = () => {
  const categories = [
    { label: "Feed", href: "/feed", icon: Newspaper },
    { label: "Skills", href: "/skills", icon: Wrench },
    { label: "MCP Servers", href: "/mcp", icon: Server },
    { label: "Prompts", href: "/prompts", icon: FileText },
    { label: "Jobs", href: "/jobs", icon: Briefcase },
    { label: "Showcase", href: "/showcase", icon: Rocket },
    { label: "Learn", href: "/learn", icon: BookOpen },
    { label: "LLM Pricing", href: "/llm-api-pricing", icon: Calculator },
    { label: "Community", href: "/community", icon: MessageSquare },
  ];

  return (
    <section className="pb-10">
      <div className="container">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className="cad-chip flex items-center justify-center gap-2 px-4 py-2.5 text-sm hover:border-[var(--cad-line-hover)] hover:text-foreground sm:inline-flex sm:py-2"
              >
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
