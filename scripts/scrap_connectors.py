"""
Playwright scraper for Claude's MCP Connectors Directory
https://claude.ai/directory - "Web" tab

Two-phase approach:
  Phase 1: Scroll listing, collect card URLs + basic info (name, tagline, logo)
  Phase 2: Visit each detail URL directly, scrape full details, save after each

Supports resumption — re-run to pick up where you left off.

Usage:
  1. pip install playwright && playwright install chromium
  2. First run:  python3 scrap_connectors.py --login
     (Log in manually in the browser window, then close it to save session)
  3. Scrape run: python3 scrap_connectors.py
  4. Resume:     python3 scrap_connectors.py  (skips already-scraped connectors)

Output: mcp_connectors.json
"""

import asyncio
import argparse
import json
import os
import re
from datetime import datetime
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

USER_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "browser_data")
OUTPUT_FILE = "mcp_connectors.json"
INDEX_FILE = "mcp_connectors_index.json"  # Phase 1 output for resumption


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

async def login_flow():
    """Open browser for manual login. Saves session for reuse."""
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            USER_DATA_DIR,
            headless=False,
            viewport={"width": 1280, "height": 900},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )
        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto("https://claude.ai/directory")
        print("Please log in to Claude in the browser window.")
        print("After you see the directory page, CLOSE the browser to save session.")
        try:
            await page.wait_for_event("close", timeout=300_000)
        except Exception:
            pass
        await context.close()
        print("Session saved! Now run: python3 scrap_connectors.py")


# ---------------------------------------------------------------------------
# Phase 1 helpers
# ---------------------------------------------------------------------------

async def click_web_tab(page):
    """Click the 'Web' tab on the directory page."""
    tab = page.locator("button, a, [role='tab']").filter(has_text="Web")
    await tab.first.click()
    await page.wait_for_timeout(2000)


async def scroll_to_load_all(page) -> int:
    """Scroll down until all connector cards are loaded. Returns card count."""
    prev_count = 0
    stable = 0
    for _ in range(60):
        await page.evaluate("window.scrollBy(0, 600)")
        await page.wait_for_timeout(700)
        curr = await page.locator("a[href*='/directory/']").count()
        if curr == prev_count:
            stable += 1
            if stable >= 4:
                break
        else:
            stable = 0
        prev_count = curr
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(1000)
    return prev_count


async def collect_cards_from_listing(page) -> list:
    """
    Extract card metadata + detail URLs from the listing page.
    Returns: [{name, tagline, logo_url, detail_url}, ...]
    """
    # Extract from <a> tags that link to /directory/{uuid}
    cards = await page.evaluate("""() => {
        const cards = [];
        const seen = new Set();
        const links = document.querySelectorAll('a[href*="/directory/"]');

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href === '/directory' || href === '/directory/') continue;
            // Only match UUID-style paths
            if (!/\\/directory\\/[0-9a-f-]{20,}/.test(href)) continue;
            if (seen.has(href)) continue;
            seen.add(href);

            const text = link.innerText || '';
            const lines = text.split('\\n')
                .map(l => l.trim())
                .filter(l => l && l !== '+' && l !== 'Connect');
            if (lines.length === 0) continue;

            const img = link.querySelector('img');
            const fullUrl = href.startsWith('http') ? href : 'https://claude.ai' + href;

            cards.push({
                name: lines[0],
                tagline: lines.length > 1 ? lines[1] : '',
                logo_url: img ? (img.src || '') : '',
                detail_url: fullUrl
            });
        }
        return cards;
    }""")

    if cards:
        return cards

    # Fallback: click each card to discover its URL
    print("  (Link extraction found nothing, falling back to click-based URL collection)")
    return await collect_cards_by_clicking(page)


async def collect_cards_by_clicking(page) -> list:
    """Fallback: click each card, record the URL it navigates to, go back."""
    cards = []
    add_btns = page.locator("button").filter(has_text="+")
    total = await add_btns.count()

    for i in range(total):
        try:
            btn = add_btns.nth(i)
            await btn.scroll_into_view_if_needed()
            await page.wait_for_timeout(200)

            # Get card name via JS
            name = await btn.evaluate("""(el) => {
                let p = el;
                for (let i = 0; i < 5; i++) {
                    if (p.parentElement) p = p.parentElement;
                    else break;
                }
                const lines = (p.innerText || '').split('\\n')
                    .map(l => l.trim())
                    .filter(l => l && l !== '+' && l !== 'Connect');
                return lines[0] || '';
            }""")

            if not name:
                continue

            # Click the card name text (not the + button) to open detail
            name_el = page.get_by_text(name, exact=True).first
            await name_el.click(timeout=5000)
            await page.wait_for_timeout(2000)

            detail_url = page.url
            if "/directory/" in detail_url and detail_url != "https://claude.ai/directory":
                cards.append({
                    "name": name,
                    "tagline": "",
                    "logo_url": "",
                    "detail_url": detail_url,
                })

            # Go back
            await page.go_back()
            await page.wait_for_timeout(2000)

            # Re-select Web tab
            try:
                await click_web_tab(page)
            except Exception:
                pass

        except Exception as e:
            print(f"  Fallback click failed for card {i}: {e}")
            try:
                await page.goto("https://claude.ai/directory", wait_until="networkidle")
                await page.wait_for_timeout(2000)
                await click_web_tab(page)
                await page.wait_for_timeout(2000)
            except Exception:
                pass

    return cards


# ---------------------------------------------------------------------------
# Phase 2: Detail scraping
# ---------------------------------------------------------------------------

async def scrape_detail(page) -> dict:
    """
    Extract connector details from a detail page (visited directly by URL).

    Page structure (top to bottom):
      Back / X buttons
      Name (heading) + Tagline (small text) + Connect button
      Description (paragraph)
      Developed by [Developer link]
      Disclaimer
      ---
      Tools [count badge]
      tool_1, tool_2, ...
      ---
      Details
      Version          Author
      1.0.0            AuthorName (link)
      Connector URL    More info
      https://...      Documentation / Support / Privacy Policy (links)
    """
    detail = {}

    try:
        await page.wait_for_selector("text=Developed by", timeout=10000)
    except PlaywrightTimeout:
        return detail

    await page.wait_for_timeout(1200)

    # Get visible text for structured parsing
    body = await page.inner_text("body")

    # === Name ===
    try:
        headings = page.locator("h1, h2")
        for i in range(await headings.count()):
            text = (await headings.nth(i).text_content()).strip()
            if text and text not in ("Details", "Tools", "Back", "More info", ""):
                detail["name"] = text
                break
    except Exception:
        pass

    # === Tagline & Description ===
    # Between name and "Developed by": tagline (short) then description (longer)
    try:
        name = detail.get("name", "")
        dev_idx = body.find("Developed by")
        if name and dev_idx > 0:
            name_idx = body.find(name)
            if name_idx >= 0:
                between = body[name_idx + len(name):dev_idx]
                lines = [
                    l.strip() for l in between.split("\n")
                    if l.strip()
                    and l.strip() != "Connect"
                    and not l.strip().startswith("Only use connectors")
                    and len(l.strip()) > 5
                ]
                if len(lines) >= 2:
                    detail["tagline"] = lines[0]
                    detail["description"] = lines[1]
                elif len(lines) == 1:
                    if len(lines[0]) < 80:
                        detail["tagline"] = lines[0]
                    else:
                        detail["description"] = lines[0]
    except Exception:
        pass

    # === Developer ===
    try:
        match = re.search(r"Developed by\s*\n?\s*(.+?)(?:\n|$)", body)
        if match:
            dev_name = match.group(1).strip()
            dev_url = ""
            try:
                all_links = page.locator("a[href^='http']")
                for i in range(await all_links.count()):
                    text = (await all_links.nth(i).text_content()).strip()
                    if text == dev_name:
                        href = await all_links.nth(i).get_attribute("href")
                        if href and "claude.ai" not in href:
                            dev_url = href
                            break
            except Exception:
                pass
            detail["developer"] = {"name": dev_name, "url": dev_url}
    except Exception:
        pass

    # === Tools ===
    try:
        tools_start = body.find("\nTools")
        if tools_start < 0:
            tools_start = body.find("Tools\n")
        details_start = body.find("\nDetails")
        if details_start < 0:
            details_start = body.find("Details\n")

        if tools_start >= 0 and details_start > tools_start:
            tools_text = body[tools_start:details_start]
            lines = [l.strip() for l in tools_text.split("\n") if l.strip()]
            tools = []
            skip = {
                "Tools", "Details", "Version", "Author", "Back", "Connect",
                "Developed by", "More info", "Connector URL",
            }
            for line in lines:
                if line in skip or line.isdigit():
                    continue
                if re.match(r'^[A-Za-z][A-Za-z0-9_.\-:]*$', line):
                    tools.append(line)
            detail["tools"] = tools
    except Exception:
        detail["tools"] = []

    # === Version ===
    try:
        match = re.search(r"Version\s*\n\s*([\d.]+)", body)
        if match:
            detail["version"] = match.group(1)
    except Exception:
        pass

    # === Connector URL ===
    try:
        match = re.search(r"Connector URL\s*\n\s*(https?://\S+)", body)
        if match:
            detail["connector_url"] = match.group(1).strip()
    except Exception:
        pass

    # === Author ===
    try:
        match = re.search(r"Author\s*\n\s*(.+?)(?:\n|$)", body)
        if match:
            author_name = match.group(1).strip()
            author_url = ""
            try:
                all_links = page.locator("a[href^='http']")
                for i in range(await all_links.count()):
                    text = (await all_links.nth(i).text_content()).strip()
                    if text == author_name:
                        href = await all_links.nth(i).get_attribute("href")
                        if href and "claude.ai" not in href:
                            author_url = href
                            break
            except Exception:
                pass
            detail["author"] = {"name": author_name, "url": author_url}
    except Exception:
        pass

    # === More info links ===
    try:
        more_info = {}
        for label in ["Documentation", "Support", "Privacy Policy"]:
            link = page.locator(f"a:has-text('{label}')").first
            if await link.count() > 0:
                href = await link.get_attribute("href")
                if href and href.startswith("http"):
                    more_info[label.lower().replace(" ", "_")] = href
        if more_info:
            detail["more_info"] = more_info
    except Exception:
        pass

    return detail


# ---------------------------------------------------------------------------
# Progress persistence
# ---------------------------------------------------------------------------

def save_progress(connectors, errors):
    """Write current results to disk (called after each connector)."""
    output = {
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "source": "https://claude.ai/directory",
        "tab": "Web",
        "total_connectors": len(connectors),
        "errors": errors if errors else None,
        "connectors": connectors,
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)


def load_scraped_urls() -> set:
    """Load detail_urls already scraped (for resumption)."""
    if not os.path.exists(OUTPUT_FILE):
        return set()
    try:
        with open(OUTPUT_FILE, "r") as f:
            data = json.load(f)
        return set(c.get("detail_url", "") for c in data.get("connectors", []))
    except Exception:
        return set()


def load_connectors() -> list:
    """Load previously scraped connectors (for resumption)."""
    if not os.path.exists(OUTPUT_FILE):
        return []
    try:
        with open(OUTPUT_FILE, "r") as f:
            data = json.load(f)
        return data.get("connectors", [])
    except Exception:
        return []


def save_index(cards):
    """Save the card index for resumption (Phase 1 output)."""
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)


def load_index() -> list:
    """Load a previously saved card index."""
    if not os.path.exists(INDEX_FILE):
        return []
    try:
        with open(INDEX_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Main scraping flow
# ---------------------------------------------------------------------------

async def scrape_directory(headless=False):
    """Two-phase scraping: collect URLs, then visit each one."""
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            USER_DATA_DIR,
            headless=headless,
            viewport={"width": 1280, "height": 900},
            slow_mo=100,
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )
        page = context.pages[0] if context.pages else await context.new_page()

        # ---------------------------------------------------------------
        # Phase 1: Collect card URLs from the listing
        # ---------------------------------------------------------------
        # Check if we already have an index from a previous run
        cards = load_index()
        if cards:
            print(f"Loaded {len(cards)} cards from previous index ({INDEX_FILE})")
        else:
            print("Phase 1: Collecting connector URLs from listing...")
            await page.goto("https://claude.ai/directory", wait_until="networkidle")
            await page.wait_for_timeout(3000)

            print("  Clicking 'Web' tab...")
            await click_web_tab(page)

            print("  Scrolling to load all connectors...")
            count = await scroll_to_load_all(page)
            print(f"  Found ~{count} cards in DOM")

            print("  Extracting card data...")
            cards = await collect_cards_from_listing(page)
            save_index(cards)

        print(f"\nFound {len(cards)} connectors:")
        for i, c in enumerate(cards):
            print(f"  {i + 1}. {c['name']}")
        print()

        if not cards:
            print("No cards found! Check login and Web tab.")
            await context.close()
            return

        # ---------------------------------------------------------------
        # Phase 2: Visit each detail URL and scrape
        # ---------------------------------------------------------------
        scraped_urls = load_scraped_urls()
        connectors = load_connectors()
        errors = []

        already = len(scraped_urls)
        if already:
            print(f"Resuming: {already} already scraped, {len(cards) - already} remaining\n")

        for idx, card in enumerate(cards):
            url = card["detail_url"]

            if url in scraped_urls:
                print(f"  [{idx + 1}/{len(cards)}] {card['name']} -- already scraped, skip")
                continue

            print(f"  [{idx + 1}/{len(cards)}] {card['name']}")

            try:
                await page.goto(url, wait_until="networkidle")
                await page.wait_for_timeout(2000)

                detail = await scrape_detail(page)

                # Merge listing info with detail info
                connector = {
                    "name": detail.get("name") or card["name"],
                    "tagline": detail.get("tagline") or card.get("tagline", ""),
                    "description": detail.get("description", ""),
                    "logo_url": card.get("logo_url", ""),
                    "detail_url": url,
                    "developer": detail.get("developer", {}),
                    "tools": detail.get("tools", []),
                    "version": detail.get("version", ""),
                    "connector_url": detail.get("connector_url", ""),
                    "author": detail.get("author", {}),
                    "more_info": detail.get("more_info", {}),
                }

                connectors.append(connector)
                scraped_urls.add(url)

                # Save after every connector
                save_progress(connectors, errors)

                tools_str = ", ".join(connector["tools"][:3])
                if len(connector["tools"]) > 3:
                    tools_str += f" +{len(connector['tools']) - 3} more"
                print(f"    OK | {connector['tagline']} | tools: [{tools_str}]")

            except Exception as e:
                error_msg = f"{card['name']} ({url}): {e}"
                print(f"    ERROR: {e}")
                errors.append(error_msg)
                save_progress(connectors, errors)

        # Final save
        save_progress(connectors, errors)

        print(f"\nDone! Scraped {len(connectors)} connectors -> {OUTPUT_FILE}")
        if errors:
            print(f"   {len(errors)} errors (see 'errors' in JSON)")

        # Clean up index file after successful full scrape
        if len(connectors) >= len(cards):
            try:
                os.remove(INDEX_FILE)
            except OSError:
                pass

        await context.close()
        return


async def main():
    parser = argparse.ArgumentParser(description="Scrape Claude MCP Connectors Directory")
    parser.add_argument("--login", action="store_true",
                        help="Open browser for manual login first")
    parser.add_argument("--headless", action="store_true",
                        help="Run headless (use after login)")
    parser.add_argument("--fresh", action="store_true",
                        help="Ignore previous progress, start from scratch")
    args = parser.parse_args()

    if args.login:
        await login_flow()
    else:
        if not os.path.exists(USER_DATA_DIR):
            print("No saved session. Run with --login first:")
            print("   python3 scrap_connectors.py --login")
            return

        if args.fresh:
            for f in [OUTPUT_FILE, INDEX_FILE]:
                if os.path.exists(f):
                    os.remove(f)
                    print(f"Removed {f}")

        await scrape_directory(headless=args.headless)


if __name__ == "__main__":
    asyncio.run(main())
