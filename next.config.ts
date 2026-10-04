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
      // Junk URLs (stray symbols, "undefined", old index pages) go home. Real unknown pages stay 404.
      { source: "/:junk([^a-zA-Z0-9]+)", destination: "/", permanent: true },
      { source: "/:junk(%2[0-9A-Fa-f].*|%3[A-Fa-f].*|%5[B-Fb-f].*|%7[B-Eb-e].*)", destination: "/", permanent: true },
      { source: "/:junk(undefined|null|index\\.html|index\\.php|index|home|default\\.aspx)", destination: "/", permanent: true },
      // One submit flow for launches.
      { source: "/showcase/submit", destination: "/launches/submit", permanent: true },
      // The forum merged into the feed: posts keep their ids.
      { source: "/community", destination: "/feed", permanent: true },
      { source: "/community/:id", destination: "/feed/:id", permanent: true },
      // Launch slug renamed after a duplicate was removed.
      { source: "/launches/tooljunction-2", destination: "/launches/tooljunction", permanent: true },
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
      // Share images are renamed when they change, so edges and crawlers can keep them forever.
      {
        source: "/og/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
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
