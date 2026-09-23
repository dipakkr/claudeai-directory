import { Folder } from "lucide-react";
import type { ShowcaseProject } from "@/types";

interface CollectionsSectionProps {
  project: ShowcaseProject;
}

export function CollectionsSection({ project }: CollectionsSectionProps) {
  const collections = project.collections ?? [];

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
        Collections
      </h2>
      <div className="flex flex-wrap gap-2">
        {collections.map((collection) => (
          <div
            key={collection}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-2 text-sm text-muted-foreground"
          >
            <Folder className="h-3.5 w-3.5" />
            {collection}
          </div>
        ))}
      </div>
    </section>
  );
}
