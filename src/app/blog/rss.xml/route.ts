import { fetchApi } from "@/lib/api-server";
import { BLOG_DESCRIPTION, SITE_NAME, SITE_URL, isoDate, postSummary, postUrl } from "@/lib/blog";
import type { BlogPost } from "@/types";

export const revalidate = 3600;

function xml(text: string) {
  return text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string);
}

export async function GET() {
  const posts = (await fetchApi<BlogPost[]>("/blog?limit=50", { revalidate: 3600 })) ?? [];
  const items = posts
    .map((post) => {
      const published = isoDate(post.published_at);
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${postUrl(post.id)}</link>
      <guid isPermaLink="true">${postUrl(post.id)}</guid>
      <description>${xml(postSummary(post))}</description>
      <category>${xml(post.category)}</category>
      <dc:creator>${xml(post.author)}</dc:creator>${published ? `\n      <pubDate>${new Date(published).toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(`${SITE_NAME} Blog`)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${xml(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
