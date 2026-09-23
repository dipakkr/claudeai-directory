import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/home-community.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { publicLaunches, selectedDiscussions } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const app = { id: "real", title: "Real", status: "listed", author_id: "member", app_url: "https://real.test/", created_at: "2026-09-20" };
assert.deepEqual(publicLaunches([
  app, { ...app, id: "older", app_url: "https://www.real.test", created_at: "2026-09-19" },
  { ...app, id: "pending", status: "pending_badge", app_url: "https://pending.test" },
  { ...app, id: "demo", app_url: "https://example.com/demo" },
  { ...app, id: "seed", author_id: null, app_url: "https://seed.test" },
  { ...app, id: "invalid", app_url: "javascript:alert(1)" },
  { ...app, id: "alternate-domain", app_url: "https://other-real.test", created_at: "2026-09-19" },
]).map(x => x.id), ["real"]);
const thread = { id: "question", title: "Claude setup question", body: "A sufficiently detailed question with useful context for readers.", tags: [], author_username: "member", created_at: "2026-09-20" };
assert.equal(selectedDiscussions([thread, { ...thread, author_username: null }, { ...thread, title: "Hosting offers" }, { ...thread, body: "AI" }]).length, 1);

const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch();
const base = process.env.QA_BASE_URL || "http://localhost:3001";
await mkdir("/tmp/home-community-qa", { recursive: true });
try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext();
    await context.addInitScript(theme => localStorage.setItem("theme", theme), theme);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
    assert.equal(await page.locator("main h1").count(), 1);
    await page.getByRole("heading", { name: "Launched on Claude AI.directory", exact: true }).waitFor();
    await page.getByRole("tab", { name: "With replies", exact: true }).click();
    assert.equal(await page.getByRole("tab", { name: "With replies", exact: true }).getAttribute("aria-selected"), "true");
    await page.getByRole("tab", { name: "Needs a reply", exact: true }).click();
    await page.getByRole("tab", { name: "Recent", exact: true }).click();
    const titles = await page.locator("#launches article").allTextContents();
    assert(!titles.some(text => /AI Resume Builder|Claude Chatbot Widget/.test(text)));
    const names = await page.locator("#launches article div a[href^='/showcase/']").allTextContents();
    assert.equal(names.length, new Set(names).size);
    assert.equal(await page.locator('[title$=" installs"]').count(), 0);
    assert((await page.locator("#community").innerText()).includes("not verified solutions"));
    for (const width of [1920, 1440, 768, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme} ${width} overflow`);
      if ([1440, 390].includes(width)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `/tmp/home-community-qa/${theme}-${width}.png`, fullPage: true });
      }
    }
    assert.deepEqual(errors, []);
    const launch = page.locator('#launches article a[href^="/showcase/"]').first();
    if (await launch.count()) {
      await launch.click();
      await page.waitForURL("**/showcase/**", { timeout: 30000 });
      assert.equal(await page.locator("main h1").count(), 1);
    }
    await context.close();
  }
  console.log("Selection unit tests, tabs, launch navigation and 10 theme/viewport checks passed.");
} finally { await browser.close(); }
