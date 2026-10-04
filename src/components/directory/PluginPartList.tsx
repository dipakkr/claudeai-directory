import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { PluginPart } from "@/types";

/** Descriptions come from frontmatter and sometimes carry markdown emphasis. */
export const plainText = (text: string) => text.replace(/\*\*|__/g, "");

/** Skills, agents or commands a plugin ships: name, what it does, its page here (or its file when it has none). */
export function PluginPartList({
  kind,
  parts,
  total,
  icon: Icon,
  prefix = "",
}: {
  /** Where its pages live; commands have none and link to their file. */
  kind: "skills" | "agents" | "commands";
  parts: PluginPart[];
  total: number;
  icon: LucideIcon;
  prefix?: string;
}) {
  const row = (part: PluginPart, external: boolean) => (
    <>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-mono text-[14px] text-foreground group-hover:text-primary">
          {prefix}
          {part.name}
          {external && <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />}
        </span>
        {part.description && <span className="mt-1 block text-[13.5px] leading-6 text-muted-foreground">{plainText(part.description)}</span>}
      </span>
    </>
  );
  const cls = "group flex gap-4 px-5 py-4 transition-colors hover:bg-foreground/[0.04]";
  return (
    <>
      <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border">
        {parts.map((part) => (
          <li key={part.slug || part.url || part.name}>
            {part.slug && kind !== "commands" ? (
              <Link href={`/${kind}/${part.slug}`} className={cls}>
                {row(part, false)}
              </Link>
            ) : (
              <a href={part.url} target="_blank" rel="noopener noreferrer" className={cls}>
                {row(part, true)}
              </a>
            )}
          </li>
        ))}
      </ul>
      {total > parts.length && <p className="mt-2 text-[13px] text-muted-foreground">Showing {parts.length} of {total}. The rest are in the source repo.</p>}
    </>
  );
}
