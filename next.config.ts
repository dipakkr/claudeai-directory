import type { NextConfig } from "next";
import courseRedirects from "./src/data/course-redirects.json";

// Courses moved to /guides: every old lesson URL goes to the matching guide lesson.
const courseLessonRedirects = Object.entries(courseRedirects as Record<string, Record<string, string>>).flatMap(([slug, lessons]) => [
  ...Object.entries(lessons).map(([from, to]) => ({
    source: `/courses/${slug}/learn/${from}`,
    destination: `/guides/${slug}/${to}`,
    permanent: true,
  })),
  { source: `/courses/${slug}/:path*`, destination: `/guides/${slug}`, permanent: true },
  { source: `/courses/${slug}`, destination: `/guides/${slug}`, permanent: true },
]);

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
      ...courseLessonRedirects,
      // Courses without written lessons, and the old index, go to the guides list.
      { source: "/courses/:path*", destination: "/guides", permanent: true },
      { source: "/courses", destination: "/guides", permanent: true },
      // One host for search engines: send claudeai.directory to www (nginx
      // passes the real Host header through). Localhost is never matched.
      {
        source: "/:path*",
        has: [{ type: "host", value: "claudeai.directory" }],
        destination: "https://www.claudeai.directory/:path*",
        permanent: true,
      },
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
      {
        source: "/showcase/:path*",
        destination: "/launches/:path*",
        permanent: true,
      },
      {
        source: "/showcase",
        destination: "/launches",
        permanent: true,
      },
      {
        source: "/setup",
        destination: "/claude-md-generator",
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
