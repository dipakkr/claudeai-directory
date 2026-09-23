import assert from "node:assert/strict";

// Run against a production build. Read the HTTP HTML directly, without JS,
// so a spinner or RSC payload alone cannot pass as indexable skill content.
const base = process.env.QA_BASE_URL || "http://localhost:3101";
const cases = [
  ["/skills", "Claude Skills"],
  ["/skills/frontend-design", "Frontend Design"],
  ["/skills/xlsx", "Excel Spreadsheet Creator &amp; Editor"],
  ["/skills?search=xlsx", "Claude Skills"],
];
for (const [path, heading] of cases) {
  const started = performance.now();
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) });
  const html = await response.text();
  const ms = Math.round(performance.now() - started);
  assert.equal(response.status, 200, path);
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert(markup.includes(heading), `${path}: missing server-rendered heading`);
  assert.match(markup, /<link rel="canonical" href="https:\/\/www\.claudeai\.directory\/skills/);
  if (path.includes("?")) {
    assert.match(markup, /<meta name="robots" content="noindex, follow"/);
    assert.match(markup, /value="xlsx"/);
  } else if (path !== "/skills") {
    assert.match(markup, /id="install"/);
    assert(!markup.includes("Loading skills..."), `${path}: pre-rendered detail contains loader`);
    assert.equal(response.headers.get("x-nextjs-cache"), "HIT", `${path}: detail not pre-rendered`);
  } else {
    assert.match(markup, /href="\/skills\/frontend-design"/);
    assert(!/<meta name="robots" content="noindex/.test(markup));
  }
  console.log(JSON.stringify({ path, status: response.status, ms, cache: response.headers.get("x-nextjs-cache") }));
}

const missing = await fetch(`${base}/skills/qa-nonexistent-skill-20260921`, {
  headers: { "User-Agent": "Googlebot" },
  signal: AbortSignal.timeout(10000),
});
assert.equal(missing.status, 404, "Missing skill must be a genuine 404 for crawlers");
console.log("Missing skill: 404. Server HTML, canonical, filtering, noindex and detail cache checks passed.");
