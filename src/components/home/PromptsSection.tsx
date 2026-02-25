import Link from "next/link";
import { ArrowUpRight, ChevronUp, CheckCircle } from "lucide-react";
import type { Prompt } from "@/types";

const PromptsSection = ({ initialPrompts = [] }: { initialPrompts?: Prompt[] }) => {
  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-foreground">Popular Prompts</h2>
          <Link
            href="/prompts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {initialPrompts.slice(0, 8).map((prompt) => (
            <Link
              key={prompt.id}
              href={`/prompts/${prompt.id}`}
              className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-1 truncate">
                    <span className="truncate">{prompt.title}</span>
                    {prompt.verified && <CheckCircle className="h-3 w-3 text-primary shrink-0" />}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{prompt.category}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {prompt.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
