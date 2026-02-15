"""
Transform raw MCP registry data into a clean, grouped schema
for the directory listing.

Usage:
  python3 transform_mcp.py

Reads:  mcp-raw.json, mcp-raw-2.json (if exists)
Writes: mcp_connectors.json
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_FILES = [
    os.path.join(SCRIPT_DIR, "mcp-raw.json"),
    os.path.join(SCRIPT_DIR, "mcp-raw-2.json"),
]
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "mcp_connectors.json")


def load_raw_servers() -> list:
    """Load and merge servers from all raw files."""
    servers = []
    for path in RAW_FILES:
        if not os.path.exists(path):
            continue
        try:
            with open(path, "r") as f:
                content = f.read().strip()
                if not content:
                    continue
                data = json.loads(content)
            servers.extend(data.get("servers", []))
            print(f"  Loaded {len(data.get('servers', []))} servers from {os.path.basename(path)}")
        except Exception as e:
            print(f"  Skipped {os.path.basename(path)}: {e}")
    return servers


def transform(raw) -> dict:
    """Transform a single raw server entry into the clean schema."""
    server = raw.get("server", {})
    reg = raw.get("_meta", {}).get("com.anthropic.api/mcp-registry", {})
    official = raw.get("_meta", {}).get("io.modelcontextprotocol.registry/official", {})

    remote = server.get("remotes", [{}])[0] if server.get("remotes") else {}

    # Build directory URL from uuid if not present
    uuid = reg.get("uuid", "")
    directory_url = reg.get("directoryUrl", "")
    if not directory_url and uuid:
        directory_url = f"https://claude.ai/directory/{uuid}"

    return {
        # --- Identity ---
        "uuid": uuid,
        "slug": reg.get("slug", ""),
        "name": reg.get("displayName") or server.get("title", ""),
        "one_liner": reg.get("oneLiner", ""),
        "description": server.get("description", ""),
        "html_content": reg.get("htmlContent", ""),
        "version": server.get("version", ""),

        # --- Branding ---
        "branding": {
            "icon_url": reg.get("iconUrl", ""),
            "logo": reg.get("logo", ""),
            "background_pattern": reg.get("backgroundPattern", ""),
            "images": reg.get("imageUrls", []),
            "hero_video_id": reg.get("heroVideoId", ""),
            "hero_video_preview": reg.get("heroVideoPreviewLink", ""),
        },

        # --- Connection ---
        "connection": {
            "url": remote.get("url", "") or reg.get("url", ""),
            "transport": remote.get("type", ""),
            "is_authless": reg.get("isAuthless", False),
            "required_fields": reg.get("requiredFields") or [],
            "server_label": reg.get("serverLabel", ""),
            "claude_code_command": reg.get("claudeCodeCopyText", ""),
            "claude_code_setup_link": reg.get("claudeCodeExternalLink", ""),
        },

        # --- Capabilities ---
        "capabilities": {
            "tools": reg.get("toolNames", []),
            "prompts": reg.get("promptNames", []),
            "permissions": reg.get("permissions", ""),
            "use_cases": reg.get("useCases", []),
            "works_with": reg.get("worksWith", []),
            "has_mcp_app": reg.get("hasMcpApp", False),
        },

        # --- Author ---
        "author": reg.get("author", {}),

        # --- Links ---
        "links": {
            "directory_url": directory_url,
            "documentation": reg.get("documentation", ""),
            "support": reg.get("support", ""),
            "privacy_policy": reg.get("privacyPolicy", ""),
            "repository": server.get("repository", {}).get("url", "") if isinstance(server.get("repository"), dict) else "",
            "website": server.get("websiteUrl", ""),
        },

        # --- Dates ---
        "dates": {
            "created_on": reg.get("createdOn", ""),
            "published_on": reg.get("publishedOn", ""),
            "updated_on": reg.get("updatedOn", ""),
        },
    }


def main():
    print("Loading raw data...")
    raw_servers = load_raw_servers()

    if not raw_servers:
        print("No servers found!")
        return

    # Deduplicate by uuid
    seen = set()
    unique = []
    for s in raw_servers:
        uuid = s.get("_meta", {}).get("com.anthropic.api/mcp-registry", {}).get("uuid", "")
        if uuid and uuid in seen:
            continue
        seen.add(uuid)
        unique.append(s)

    print(f"\nTransforming {len(unique)} servers...")
    connectors = [transform(s) for s in unique]

    # Sort alphabetically by name
    connectors.sort(key=lambda c: c["name"].lower())

    output = {
        "total": len(connectors),
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "connectors": connectors,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(connectors)} connectors -> {OUTPUT_FILE}")

    # Summary stats
    has_html = sum(1 for c in connectors if c["html_content"])
    has_slug = sum(1 for c in connectors if c["slug"])
    has_cases = sum(1 for c in connectors if c["capabilities"]["use_cases"])
    has_cmd = sum(1 for c in connectors if c["connection"]["claude_code_command"])
    has_video = sum(1 for c in connectors if c["branding"]["hero_video_id"])
    has_images = sum(1 for c in connectors if c["branding"]["images"])
    authless = sum(1 for c in connectors if c["connection"]["is_authless"])
    has_app = sum(1 for c in connectors if c["capabilities"]["has_mcp_app"])
    total_tools = sum(len(c["capabilities"]["tools"]) for c in connectors)

    print(f"\n--- Stats ---")
    print(f"  Total tools across all servers: {total_tools}")
    print(f"  Authless (no login needed):     {authless}")
    print(f"  Has MCP app:                    {has_app}")
    print(f"  Has rich HTML content:          {has_html}")
    print(f"  Has slug:                       {has_slug}")
    print(f"  Has use case tags:              {has_cases}")
    print(f"  Has claude code command:        {has_cmd}")
    print(f"  Has hero video:                 {has_video}")
    print(f"  Has promo images:               {has_images}")


if __name__ == "__main__":
    main()
