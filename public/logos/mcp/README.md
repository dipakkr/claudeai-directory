# MCP logo assets

Reviewed on 2026-10-23 against all 157 public catalog records (156 unique slugs; Slack has a legacy duplicate).

`src/data/mcp-logos.json` maps slugs to content-hashed local files. `src/data/mcp-logo-sources.json` records original URLs and SHA-256 digests. These are existing product or publisher assets, not newly designed marks. Related services may share their parent organization logo; reference/demo servers use the published MCP mark. Original artwork is preserved.

To add or change a logo, download the image from the product website or its verified connector page, verify it decodes as an image, inspect it on a white tile, give it a content-hashed filename, and update both manifests. Do not put a webpage or MCP endpoint in an image source. Never copy scripts or active SVG content. Run `node --test tests/mcp-logos.test.cjs` and check both listing and detail pages.

Clockwise's current homepage announces service shutdown. Its original inline wordmark is retained here; listing availability needs a separate catalog review.
