import { ArrowUpRight, Github } from "lucide-react";

export default function GitHubBanner() {
  return (
    <a
      href="https://github.com/dipakkr/awesome-agent-skills"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-8 items-center justify-center gap-2 border-b border-white/10 bg-[#242321] px-4 py-1 text-[11px] font-medium leading-4 text-[#eeeae4] transition-colors hover:bg-[#2e2c29] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#eeeae4] sm:gap-3 sm:text-xs"
    >
      <Github size={15} className="shrink-0" aria-hidden="true" />
      <span className="max-w-[230px] sm:max-w-none">
        Open-source skills for your AI agents
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[11px] font-semibold transition-colors group-hover:bg-white/10">
        Explore on GitHub <ArrowUpRight size={12} aria-hidden="true" />
      </span>
    </a>
  );
}
