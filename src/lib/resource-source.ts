import type { Agent, Skill } from "@/types";

export interface SourceLocation {
  repo: string;
  path: string;
  ref: string;
  url: string;
}

const treeUrl = (repo: string, ref: string, path: string) => `https://github.com/${repo}/tree/${ref}/${path}`;
const blobUrl = (repo: string, ref: string, path: string) => `https://github.com/${repo}/blob/${ref}/${path}`;

/**
 * Where a skill's folder lives. Structured install metadata wins. Otherwise
 * official skills live at anthropics/skills/skills/<folder>: rows carry
 * inconsistent `location` prefixes ("skills/pdf/…", "skills/skills/pdf/…",
 * "/mnt/…") and github_url often points at the wrong repo root, so only the
 * folder name is trusted.
 */
export function skillSource(skill: Skill): SourceLocation | null {
  const install = skill.install;
  if (install?.source_repo && install.source_path) {
    const ref = install.source_ref || "main";
    return { repo: install.source_repo, path: install.source_path, ref, url: treeUrl(install.source_repo, ref, install.source_path) };
  }
  const tree = skill.github_url?.match(/github\.com\/([^/]+\/[^/#?]+)\/tree\/([^/]+)\/(.+?)\/?$/);
  if (tree) return { repo: tree[1], ref: tree[2], path: tree[3], url: skill.github_url! };
  if (skill.source !== "official") return null;
  const folder = skill.location?.match(/([^/]+)\/SKILL\.md$/)?.[1] ?? skill.name;
  const path = `skills/${folder}`;
  return { repo: "anthropics/skills", path, ref: "main", url: treeUrl("anthropics/skills", "main", path) };
}

export function agentSource(agent: Agent): SourceLocation | null {
  const install = agent.install;
  if (install?.source_repo && install.source_path) {
    const ref = install.source_ref || "main";
    return { repo: install.source_repo, path: install.source_path, ref, url: blobUrl(install.source_repo, ref, install.source_path) };
  }
  return null;
}
