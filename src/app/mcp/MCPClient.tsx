import ListingPage from "@/components/directory/ListingPage";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { buildOrders, mcpToItem, type Orders } from "@/lib/directory";
import type { MCPServer } from "@/types";

export default function MCPClient({
  initialData,
  initialParams,
  ranked,
}: {
  initialData: MCPServer[];
  initialParams: { category?: string; search?: string };
  ranked: Orders;
}) {
  const items = initialData.map(mcpToItem);
  return (
    <ListingPage
      title="MCP servers"
      description="Help Claude Code reach your tools, data and services. Copy a verified install command instead of piecing it together from a README."
      items={items}
      orders={buildOrders(items, ranked, false)}
      searchPlaceholder="Search MCP servers…"
      initialCategory={initialParams.category}
      initialQuery={initialParams.search}
      schema={
        <CollectionPageSchema
          name="MCP Servers"
          description="Browse and discover Model Context Protocol (MCP) servers to connect Claude AI to your favorite tools."
          url="https://www.claudeai.directory/mcp"
        />
      }
    >
      <h2>What is the Model Context Protocol (MCP)?</h2>
      <p>
        The <strong>Model Context Protocol (MCP)</strong> is an open standard for connecting AI applications to external
        data sources, tools, and workflows. Think of MCP like a USB-C port for AI: just as USB-C provides a universal
        way to connect devices and peripherals, MCP provides a standardized way to connect AI models like Claude to the
        systems they need to work with.
      </p>
      <h3>What can MCP do?</h3>
      <ul className="mb-3 list-inside list-disc space-y-1 pl-1">
        <li>Connect AI assistants to your Google Calendar, Notion, Slack, and other everyday tools.</li>
        <li>Let Claude Code generate full web apps from a Figma design by connecting to the Figma MCP server.</li>
        <li>Enable enterprise chatbots to query multiple databases across an organization.</li>
        <li>Give AI models access to specialized tools from search engines to 3D design software.</li>
      </ul>
      <h3>How does MCP work?</h3>
      <p>
        MCP follows a client-server architecture. An <strong>MCP host</strong> connects to one or more{" "}
        <strong>MCP servers</strong> via the protocol. Each server exposes tools, resources, and prompts. The host manages
        connections and routes requests between the AI and the servers.
      </p>
      <p>
        MCP is open source and maintained by Anthropic. Learn more at the{" "}
        <a
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          official MCP documentation
        </a>
        .
      </p>
    </ListingPage>
  );
}
