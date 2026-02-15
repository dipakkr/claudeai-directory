export interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  githubUrl?: string;
  documentationUrl?: string;
  stars: number;
  trending: boolean;
  features: string[];
  installation: string;
  useCases: string[];
  tags: string[];
}

export const mcpServers: MCPServer[] = [
  {
    id: "filesystem",
    name: "Filesystem MCP Server",
    description: "Read and write files on the local filesystem. Perfect for file management, code generation, and document processing.",
    category: "System",
    author: "Anthropic",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    documentationUrl: "https://modelcontextprotocol.io/servers/filesystem",
    stars: 2840,
    trending: true,
    features: [
      "Read files and directories",
      "Write and create files",
      "Search files by pattern",
      "Get file metadata",
      "Safe file operations with validation"
    ],
    installation: "npm install -g @modelcontextprotocol/server-filesystem",
    useCases: [
      "Code generation and file creation",
      "Document processing and analysis",
      "Project scaffolding",
      "File organization and management"
    ],
    tags: ["filesystem", "file-management", "system", "official"]
  },
  {
    id: "github",
    name: "GitHub MCP Server",
    description: "Interact with GitHub repositories, issues, pull requests, and more. Manage your codebase directly from Claude.",
    category: "Development",
    author: "Anthropic",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    documentationUrl: "https://modelcontextprotocol.io/servers/github",
    stars: 1920,
    trending: true,
    features: [
      "Read repository contents",
      "Create and manage issues",
      "Handle pull requests",
      "Search repositories",
      "Manage branches and commits"
    ],
    installation: "npm install -g @modelcontextprotocol/server-github",
    useCases: [
      "Code review automation",
      "Issue management",
      "Repository analysis",
      "CI/CD integration"
    ],
    tags: ["github", "git", "development", "version-control", "official"]
  },
  {
    id: "postgres",
    name: "PostgreSQL MCP Server",
    description: "Connect to PostgreSQL databases and execute queries. Perfect for data analysis and database management.",
    category: "Database",
    author: "Anthropic",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    documentationUrl: "https://modelcontextprotocol.io/servers/postgres",
    stars: 1450,
    trending: true,
    features: [
      "Execute SQL queries",
      "Schema inspection",
      "Table and column information",
      "Transaction support",
      "Query optimization suggestions"
    ],
    installation: "npm install -g @modelcontextprotocol/server-postgres",
    useCases: [
      "Database analysis",
      "Data extraction",
      "Report generation",
      "Database administration"
    ],
    tags: ["postgresql", "database", "sql", "data", "official"]
  },
  {
    id: "brave-search",
    name: "Brave Search MCP Server",
    description: "Perform web searches using Brave Search API. Get real-time search results and web information.",
    category: "Search",
    author: "Anthropic",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    documentationUrl: "https://modelcontextprotocol.io/servers/brave-search",
    stars: 890,
    trending: false,
    features: [
      "Web search",
      "Image search",
      "News search",
      "Search result ranking",
      "API key authentication"
    ],
    installation: "npm install -g @modelcontextprotocol/server-brave-search",
    useCases: [
      "Real-time information retrieval",
      "Research assistance",
      "Content discovery",
      "Fact checking"
    ],
    tags: ["search", "brave", "web-search", "api", "official"]
  },
  {
    id: "slack",
    name: "Slack MCP Server",
    description: "Send messages, read channels, and manage Slack workspaces. Integrate Claude with your team communication.",
    category: "Communication",
    author: "Community",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    stars: 720,
    trending: false,
    features: [
      "Send messages to channels",
      "Read channel history",
      "Manage users",
      "File sharing",
      "Thread management"
    ],
    installation: "npm install -g @modelcontextprotocol/server-slack",
    useCases: [
      "Team notifications",
      "Automated reporting",
      "Channel monitoring",
      "Workflow automation"
    ],
    tags: ["slack", "communication", "messaging", "team", "community"]
  },
  {
    id: "google-drive",
    name: "Google Drive MCP Server",
    description: "Access and manage Google Drive files and folders. Read documents, spreadsheets, and presentations.",
    category: "Storage",
    author: "Community",
    githubUrl: "https://github.com/example/mcp-server-google-drive",
    stars: 650,
    trending: false,
    features: [
      "List files and folders",
      "Read file contents",
      "Upload files",
      "Share files",
      "Search files"
    ],
    installation: "npm install -g mcp-server-google-drive",
    useCases: [
      "Document analysis",
      "Content extraction",
      "File organization",
      "Collaboration workflows"
    ],
    tags: ["google-drive", "storage", "cloud", "files", "community"]
  },
  {
    id: "web-scraper",
    name: "Web Scraper MCP Server",
    description: "Scrape and extract data from websites. Get real-time web content for analysis and processing.",
    category: "Data",
    author: "Community",
    githubUrl: "https://github.com/example/mcp-server-web-scraper",
    stars: 1100,
    trending: true,
    features: [
      "Extract HTML content",
      "Parse structured data",
      "Handle JavaScript rendering",
      "Respect robots.txt",
      "Rate limiting"
    ],
    installation: "npm install -g mcp-server-web-scraper",
    useCases: [
      "Data collection",
      "Competitor analysis",
      "Content monitoring",
      "Research automation"
    ],
    tags: ["web-scraping", "data-extraction", "automation", "community"]
  },
  {
    id: "sqlite",
    name: "SQLite MCP Server",
    description: "Work with SQLite databases. Lightweight database operations for local data storage and analysis.",
    category: "Database",
    author: "Community",
    githubUrl: "https://github.com/example/mcp-server-sqlite",
    stars: 580,
    trending: false,
    features: [
      "Query SQLite databases",
      "Schema management",
      "Data import/export",
      "Backup and restore",
      "Transaction support"
    ],
    installation: "npm install -g mcp-server-sqlite",
    useCases: [
      "Local data storage",
      "Quick prototyping",
      "Data analysis",
      "Development databases"
    ],
    tags: ["sqlite", "database", "local", "lightweight", "community"]
  },
  {
    id: "puppeteer",
    name: "Puppeteer MCP Server",
    description: "Control headless Chrome browsers. Automate web interactions, screenshots, and browser automation.",
    category: "Automation",
    author: "Community",
    githubUrl: "https://github.com/example/mcp-server-puppeteer",
    stars: 950,
    trending: true,
    features: [
      "Browser automation",
      "Screenshot capture",
      "PDF generation",
      "Form filling",
      "JavaScript execution"
    ],
    installation: "npm install -g mcp-server-puppeteer",
    useCases: [
      "Web testing",
      "Screenshot automation",
      "Form automation",
      "E2E testing"
    ],
    tags: ["puppeteer", "browser", "automation", "testing", "community"]
  },
  {
    id: "memory",
    name: "Memory MCP Server",
    description: "Persistent memory storage for Claude. Remember conversations, facts, and context across sessions.",
    category: "System",
    author: "Anthropic",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    stars: 1350,
    trending: true,
    features: [
      "Persistent storage",
      "Context retrieval",
      "Memory search",
      "Session management",
      "Data encryption"
    ],
    installation: "npm install -g @modelcontextprotocol/server-memory",
    useCases: [
      "Long-term context",
      "Personal assistants",
      "Knowledge bases",
      "Conversation history"
    ],
    tags: ["memory", "storage", "context", "persistence", "official"]
  },
  {
    id: "fetch",
    name: "Fetch MCP Server",
    description: "Make HTTP requests and fetch web content. Simple and powerful web interaction capabilities.",
    category: "Network",
    author: "Anthropic",
    githubUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    stars: 1120,
    trending: false,
    features: [
      "HTTP GET/POST requests",
      "Header management",
      "Response parsing",
      "Error handling",
      "Request caching"
    ],
    installation: "npm install -g @modelcontextprotocol/server-fetch",
    useCases: [
      "API integration",
      "Web content retrieval",
      "Data fetching",
      "Service communication"
    ],
    tags: ["http", "network", "api", "fetch", "official"]
  },
  {
    id: "gmail",
    name: "Gmail MCP Server",
    description: "Read and send emails through Gmail. Manage your inbox and automate email workflows.",
    category: "Communication",
    author: "Community",
    githubUrl: "https://github.com/example/mcp-server-gmail",
    stars: 680,
    trending: false,
    features: [
      "Read emails",
      "Send emails",
      "Search messages",
      "Manage labels",
      "Attachment handling"
    ],
    installation: "npm install -g mcp-server-gmail",
    useCases: [
      "Email automation",
      "Inbox management",
      "Email analysis",
      "Notification systems"
    ],
    tags: ["gmail", "email", "communication", "automation", "community"]
  }
];

export const getMCPServerById = (id: string): MCPServer | undefined => {
  return mcpServers.find(server => server.id === id);
};

export const getMCPServersByCategory = (category: string): MCPServer[] => {
  return mcpServers.filter(server => server.category === category);
};

export const getTrendingMCPServers = (): MCPServer[] => {
  return mcpServers.filter(server => server.trending);
};

export const searchMCPServers = (query: string): MCPServer[] => {
  const lowerQuery = query.toLowerCase();
  return mcpServers.filter(server =>
    server.name.toLowerCase().includes(lowerQuery) ||
    server.description.toLowerCase().includes(lowerQuery) ||
    server.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

