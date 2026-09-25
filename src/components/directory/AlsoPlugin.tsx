import Link from "next/link";

/** "{name} also comes as a Claude Code plugin", shown when a plugin has the same slug. */
export function AlsoPlugin({ href, name, lead }: { href: string; name: string; lead: string }) {
  return (
    <p className="text-[13.5px] text-[var(--cad-desc)]">
      {lead}{" "}
      <Link href={href} className="text-[var(--cad-link)] underline underline-offset-[3px]">
        {name} is also available as a Claude Code plugin
      </Link>
      .
    </p>
  );
}
