/**
 * Links and images inside a README or SKILL.md fetched from a repo are written
 * relative to that file. Rendered on this site without a base, a link such as
 * `[guide](pptxgenjs.md)` becomes /skills/pptxgenjs.md and 404s (Search Console
 * reported exactly that). This resolves them against the file's home on GitHub
 * instead, and serves images from raw.githubusercontent.com.
 */

const GITHUB = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/(tree|blob)\/([^/]+)(\/[^?#]*)?)?\/?(?:[?#].*)?$/i;

export function repoUrlTransform(sourceUrl?: string | null) {
  let base: string | undefined;
  let root: string | undefined;
  const m = sourceUrl?.match(GITHUB);
  if (m) {
    const [, owner, repo, kind, ref = "HEAD", path = ""] = m;
    root = `https://github.com/${owner}/${repo}/blob/${ref}/`;
    const isFile = kind === "blob" && /\.[a-z0-9]+$/i.test(path);
    base = isFile ? `${root}${path.replace(/^\//, "")}` : `${root}${path.replace(/^\/|\/$/g, "")}${path.replace(/\//g, "") ? "/" : ""}`;
  } else if (sourceUrl) {
    base = sourceUrl;
  }

  return (url: string, key: string) => {
    if (!url) return "";
    if (url.startsWith("#") || /^(https?:|mailto:)/i.test(url)) return url;
    if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return "";
    if (!base) return "";
    try {
      const resolved = url.startsWith("/") && root ? new URL(url.replace(/^\/+/, ""), root).href : new URL(url, base).href;
      return key === "src"
        ? resolved.replace(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/(?:blob|tree)\//i, "https://raw.githubusercontent.com/$1/")
        : resolved;
    } catch {
      return "";
    }
  };
}
