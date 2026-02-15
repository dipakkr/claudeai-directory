import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const apiHost = process.env.API_INTERNAL_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiHost}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/mcp-servers",
        destination: "/mcp",
        permanent: true,
      },
      {
        source: "/mcp-servers/:slug",
        destination: "/mcp/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
