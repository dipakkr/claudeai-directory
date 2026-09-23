import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || "playwright");
const base = process.env.QA_BASE_URL || "http://localhost:3001";
const output = process.env.QA_OUTPUT || "/tmp/claude-resource-qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const routes = ["/mcp/filesystem", "/skills/frontend-design", "/agents/code-reviewer", "/skills/xlsx", "/agents/code-explorer"];
try {
  for (const route of routes) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
      await context.addInitScript(theme => localStorage.setItem("theme", theme), theme);
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.setViewportSize({ width: 1920, height: 1080 });
      const response = await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.locator("#guide-sources").waitFor();
      if (route === routes[0] && theme === "light") {
        const rail = page.locator("aside[aria-label*='right']");
        const before = await rail.getAttribute("aria-label");
        await page.getByRole("button", { name: "Pause sponsor rotation", exact: true }).click();
        await page.locator("main h1").click();
        await page.waitForTimeout(11000);
        assert.equal(await rail.getAttribute("aria-label"), before);
        await page.getByRole("button", { name: "Resume sponsor rotation", exact: true }).click();
        await page.locator("main h1").click();
        await page.waitForTimeout(11000);
        assert.notEqual(await rail.getAttribute("aria-label"), before);
      }
      const sourceInfo = page.getByRole("button", { name: "About this guide", exact: true });
      await sourceInfo.hover();
      await page.getByRole("tooltip").waitFor();
      assert((await page.getByRole("tooltip").innerText()).includes("Not independently tested"));
      const main = await page.locator("main").innerText();
      assert(!main.includes("Content completeness"));
      assert(!main.includes("Indexing recommendation"));
      await page.mouse.move(0, 0);
      assert.equal(await page.locator("main h1").count(), 1);
      if (route === "/skills/xlsx") {
        assert.equal(await page.locator("main h1").innerText(), "Excel Spreadsheet Creator & Editor");
        assert((await page.title()).includes("XLSX"));
        const sample = await context.request.get(`${base}/examples/xlsx/budget.csv`);
        assert.equal(sample.status(), 200);
        assert((await sample.text()).includes("Hosting,300,350"));
      }
      if (route === "/agents/code-explorer") {
        assert.equal(await page.locator("main h1").innerText(), "Code Explorer");
        assert((await page.title()).includes("Code Explorer"));
      }
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://www.claudeai.directory${route}`);
      assert((await page.locator('meta[name="description"]').getAttribute("content")).length > 60);
      const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
      for (const text of schemas) {
        const schema = JSON.parse(text);
        if (schema["@type"] === "SoftwareApplication") assert.equal(schema.offers, undefined);
      }
      await page.getByRole("button", { name: "Copy example", exact: true }).click();
      assert((await page.evaluate(() => navigator.clipboard.readText())).length > 80);
      await page.locator('nav[aria-label="Resource guide sections"] a[href="#setup-guide"]').click();
      assert.equal(new URL(page.url()).hash, "#setup-guide");
      const external = await page.locator("main a[target='_blank']").evaluateAll(links => links.map(a => ({ href: a.href, rel: a.rel })));
      assert(external.every(link => link.href.startsWith("https://") && link.rel.includes("noopener")));
      for (const width of [1920, 1440, 768, 390, 360]) {
        await page.setViewportSize({ width, height: 1000 });
        const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
        assert(dimensions.scroll <= dimensions.client + 1, `${route} ${theme} ${width}: horizontal overflow ${JSON.stringify(dimensions)}`);
        await page.evaluate(() => window.scrollTo(0, 0));
        const filename = `${route.replaceAll("/", "-").slice(1)}-${theme}-${width}.png`;
        if (width === 390 || width === 1920) await page.screenshot({ path: `${output}/${filename}`, animations: "disabled", timeout: 15000 });
        results.push({ route, theme, width, status: response.status(), title: await page.title(), ...dimensions, errors });
      }
      if (route.startsWith("/skills/")) {
        await page.getByRole("link", { name: "Back to Skills", exact: true }).click();
        await page.waitForURL("**/skills", { timeout: 10000 });
        await page.getByRole("heading", { name: "Claude Skills", exact: true }).waitFor();
      }
      await context.close();
    }
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ checks: results.length, routes, screenshots: output, errors: results.flatMap(r => r.errors) }));
