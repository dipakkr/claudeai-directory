import type { ConnectorGuide } from "@/lib/connector-guides";

const CHECKED = "2026-10-05";
const DOCS = "https://www.home-assistant.io/integrations/mcp_server/";

const homeAssistant: ConnectorGuide = {
  slug: "home-assistant",
  app: "Home Assistant",
  category: "smart-home",
  description:
    "Connect Home Assistant to Claude with its built-in MCP Server integration: tested setup for Claude Code, plus the remote connector for Claude.ai and Claude Desktop.",
  quickAnswer:
    "Home Assistant has an official MCP Server integration. Turn it on, create a long-lived access token, and add `http://<your-home-assistant>:8123/api/mcp` to Claude Code with that token. Claude can then control the devices you expose to Assist. Claude.ai and Claude Desktop connectors need Home Assistant on a public HTTPS address, such as Home Assistant Cloud.",
  keyFacts: [
    "Home Assistant's built-in Model Context Protocol Server integration, added in 2025.2, serves MCP at `/api/mcp`.",
    "Claude can only see and control devices exposed to Assist. Locks, alarms and cameras are not exposed by default.",
    "Claude Code connects over your local network with a long-lived access token.",
    "Claude.ai and Claude Desktop custom connectors connect from Anthropic's cloud, so Home Assistant must be reachable on a public HTTPS address.",
    "Since 2026.9, tool names start with their domain, for example `intent__HassTurnOff`.",
  ],
  evidence: [
    {
      src: "/connectors/home-assistant/claude-code-lights.png",
      width: 1600,
      height: 434,
      alt: "Claude Code in a terminal listing which Home Assistant lights are on and in which rooms",
    },
    {
      src: "/connectors/home-assistant/claude-code-kitchen.png",
      width: 1600,
      height: 210,
      alt: "Claude Code in a terminal turning off the kitchen lights through Home Assistant",
    },
    {
      src: "/connectors/home-assistant/claude-code-lock.png",
      width: 1600,
      height: 271,
      alt: "Claude Code in a terminal declining to lock the front door because the lock is not exposed to Assist",
    },
  ],
  methods: [
    {
      kind: "official_mcp",
      name: "MCP Server integration",
      maintainer: "Home Assistant",
      isOfficial: true,
      url: DOCS,
      worksIn: ["claude_code", "desktop", "claude_ai"],
      auth: "api_key",
      needs: "Home Assistant 2025.2 or later",
      lastActivity: "2026-09-27",
      status: "active",
      note: "Built into Home Assistant. Claude gets the same controls as the Assist voice assistant, limited to the devices you expose to it. Sign in with a token, or with OAuth for Claude.ai.",
      source: { url: DOCS, verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "ha-mcp",
      maintainer: "homeassistant-ai",
      isOfficial: false,
      url: "https://github.com/homeassistant-ai/ha-mcp",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "uv, or the Home Assistant add-on",
      lastActivity: "2026-10-04",
      status: "active",
      note: "The most popular community server. It reaches everything in Home Assistant, not just exposed devices, including automations, history and logs. More power, so more care is needed.",
      source: { url: "https://github.com/homeassistant-ai/ha-mcp", verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "hass-mcp",
      maintainer: "voska",
      isOfficial: false,
      url: "https://github.com/voska/hass-mcp",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "uv or Docker",
      lastActivity: "2026-08-06",
      status: "active",
      note: "A smaller community server for reading entities, calling services and checking history and logs.",
      source: { url: "https://github.com/voska/hass-mcp", verifiedOn: CHECKED },
    },
  ],
  setup: [
    {
      method: 0,
      title: "How to connect Home Assistant to Claude Code",
      surface: "Claude Code",
      steps: [
        { text: "In Home Assistant, go to Settings, then Devices & services, and add the `Model Context Protocol Server` integration. Choose Assist as the API." },
        { text: "Check what Claude will be able to control in Settings, then Voice assistants, then the Expose tab. Leave locks, alarms and garage doors off unless you really want Claude to use them." },
        { text: "Open your user profile, go to the Security tab, and create a long-lived access token. Copy it now: it's only shown once." },
        {
          text: "Add Home Assistant to Claude Code. Replace the address with your own and `YOUR_TOKEN` with the token.",
          code: {
            label: "Terminal",
            value:
              'claude mcp add --transport http homeassistant http://homeassistant.local:8123/api/mcp \\\n  --header "Authorization: Bearer YOUR_TOKEN"',
          },
        },
        { text: "Check the connection: in Claude Code, run `/mcp` and look for `homeassistant`. Then ask what's on, or ask Claude to turn something off." },
      ],
      source: { url: DOCS, verifiedOn: CHECKED },
    },
    {
      method: 0,
      title: "How to connect Home Assistant to Claude.ai or Claude Desktop",
      surface: "Claude.ai and Claude Desktop",
      steps: [
        { text: "Make Home Assistant reachable on a public HTTPS address, and set that as its External URL. Home Assistant Cloud is the simplest way: its docs recommend it to avoid proxy and tunnel problems." },
        { text: "In Claude, open Customize, then Connectors. Click + and choose Add custom connector." },
        { text: "Enter `https://<your-external-url>/api/mcp` as the server URL. Under Advanced settings, set the OAuth Client ID to `https://claude.ai` and leave the secret blank." },
        { text: "Connect, sign in to Home Assistant when asked, and approve access." },
      ],
      source: { url: DOCS, verifiedOn: CHECKED },
    },
  ],
  permissions: [
    {
      heading: "What Claude can control",
      body: "With the built-in integration, only devices exposed to Assist. In our test, Claude could switch lights but refused to lock the front door, because locks aren't exposed by default.",
    },
    {
      heading: "The token",
      body: "A long-lived token lasts 10 years and carries the full rights of the user who created it. Exposure limits what the MCP tools can do, not the token itself. Consider a separate, non-admin user for Claude. From 2026.10, non-admin users connect through `/api/mcp/assist`.",
    },
    {
      heading: "Revoking access",
      body: "Delete the token in your user profile, on the Security tab. In Claude Code, also run `claude mcp remove homeassistant`.",
    },
    {
      heading: "Community servers",
      body: "ha-mcp and hass-mcp use the Home Assistant API directly, so they can reach everything the token can, not just exposed devices.",
    },
  ],
  prompts: [
    {
      prompt: "Which lights are on right now, and in which rooms?",
      outcome: "Claude reads the live state of every exposed light and returns which are on, their brightness, and the room each one is in.",
      basis: "tested",
    },
    {
      prompt: "What are my thermostats set to, and what's the current temperature?",
      outcome: "Claude lists each thermostat's mode, target and current temperature, and points out which ones are likely heating or cooling.",
      basis: "tested",
    },
    {
      prompt: "Turn off the kitchen lights.",
      outcome: "Claude turns the light off and confirms it. If the light isn't assigned to a room, it falls back to the light's name and tells you how to fix the room.",
      basis: "tested",
    },
    {
      prompt: "Add 'buy milk' to my shopping list.",
      outcome: "Claude adds the item to Home Assistant's shopping list.",
      basis: "tested",
    },
    {
      prompt: "Lock the front door.",
      outcome: "With default settings Claude can't, because locks aren't exposed. It tells you where to expose the lock if you want it to.",
      basis: "tested",
    },
  ],
  troubleshooting: [
    {
      problem: "`404 Not Found` on `/api/mcp`",
      fix: "The MCP Server integration isn't set up yet. Add it in Settings, then Devices & services.",
      sourceUrl: DOCS,
    },
    {
      problem: "`401` when connecting",
      fix: "The token is wrong or was deleted. Create a new one. From 2026.10, a non-admin user also gets this on `/api/mcp`: use `/api/mcp/assist`, or turn off Require an administrator account in the integration's options.",
      sourceUrl: DOCS,
    },
    {
      problem: "Claude says it can't find a device that exists",
      fix: "The device isn't exposed to Assist. Turn it on in Settings, then Voice assistants, then Expose, and ask again.",
      sourceUrl: "https://www.home-assistant.io/voice_control/voice_remote_expose_devices/",
    },
    {
      problem: "Claude Desktop shows the server as disconnected when using mcp-proxy",
      fix: "Current mcp-proxy releases crash with a newer MCP library (`cannot import name 'request_ctx'`). Run it with `uvx --with \"mcp<2.0.0\" mcp-proxy`, or use the remote connector instead.",
      sourceUrl: "https://github.com/sparfenyuk/mcp-proxy/issues/235",
    },
  ],
  faq: [
    {
      q: "Does Home Assistant have an official Claude integration?",
      a: "Yes. The Model Context Protocol Server integration, built into Home Assistant since 2025.2, lets Claude control your home. There's also a separate Anthropic integration that works the other way round: it lets Home Assistant's voice assistant use Claude.",
    },
    {
      q: "Can Claude unlock my doors?",
      a: "Only if you expose the lock to Assist. Locks, alarms and cameras aren't exposed by default, and in our test Claude refused to lock a door that wasn't exposed.",
    },
    {
      q: "Do I need Home Assistant Cloud?",
      a: "Not for Claude Code, which connects over your local network. Claude.ai and Claude Desktop connectors connect from Anthropic's cloud, so they need a public HTTPS address, and Home Assistant Cloud is the simplest way to get one.",
    },
    {
      q: "What's the difference between the built-in server and ha-mcp?",
      a: "The built-in server gives Claude the Assist voice controls for exposed devices only. ha-mcp reaches all of Home Assistant, including automations, history and logs, so it can do more but needs more care.",
    },
    {
      q: "Which Home Assistant version do I need?",
      a: "2025.2 or later for the MCP Server integration. We tested with 2026.9.4.",
    },
  ],
  related: ["obsidian", "wordpress"],
  publishedOn: CHECKED,
  verifiedOn: CHECKED,
  status: "published",
};

export default homeAssistant;
