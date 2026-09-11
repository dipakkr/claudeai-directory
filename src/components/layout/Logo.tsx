import Link from "next/link";

export function Logo({ muted = false }: { muted?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80 ${muted ? "opacity-60" : ""}`}
      aria-label="claudeai.directory home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        claudeai<span className="font-normal text-muted-foreground">.directory</span>
      </span>
    </Link>
  );
}
