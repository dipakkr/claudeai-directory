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
    <section className="pb-12">
      <div className="container">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card hover:border-primary/30 transition-all"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
