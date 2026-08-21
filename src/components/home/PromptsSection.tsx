import Link from "next/link";
import { ArrowUpRight, ChevronUp, CheckCircle } from "lucide-react";
import type { Prompt } from "@/types";

const PromptsSection = ({ initialPrompts = [] }: { initialPrompts?: Prompt[] }) => {
  return (
    <section className="cad-section cad-section-rule">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Popular Prompts</h2>
          <Link
            href="/prompts"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {initialPrompts.slice(0, 8).map((prompt) => (
            <Link
              key={prompt.id}
              href={`/prompts/${prompt.id}`}
              className="cad-card group p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-1 truncate">
                    <span className="truncate">{prompt.title}</span>
                    {prompt.verified && <CheckCircle className="h-3 w-3 text-primary shrink-0" />}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{prompt.category}</p>
                </div>
                <ArrowUpRight className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {prompt.description}
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ChevronUp className="h-3 w-3 text-primary" />
                  {prompt.upvotes}
                </span>
                <span className="capitalize">{prompt.complexity}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromptsSection;
