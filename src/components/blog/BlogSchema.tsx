import type { BlogPost } from "@/types";
import { SITE_NAME, SITE_URL, isoDate, postSummary, postUrl, wordCount } from "@/lib/blog";

// Community posts put user text into JSON-LD, so escape "<" to keep a title
// like "</script>" from closing the tag.
function Ld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-mark-512.png`, width: 512, height: 512 },
};

export function BlogPostingSchema({ post }: { post: BlogPost }) {
  const url = postUrl(post.id);
  const published = isoDate(post.published_at);
  const modified = isoDate(post.updated_at) ?? published;
  // Only community posts are tied to a real person's profile. Editorial posts
  // are credited to the byline exactly as published.
  const author = post.author_id
    ? {
        "@type": "Person",
        name: post.author,
        ...(post.author_username ? { url: `${SITE_URL}/u/${post.author_username}` } : {}),
        ...(post.author_bio ? { description: post.author_bio } : {}),
      }
    : { "@type": "Organization", name: post.author || SITE_NAME };

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: postSummary(post),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: post.cover_image || `${url}/opengraph-image`,
    author,
    publisher,
    articleSection: post.category,
    wordCount: wordCount(post.content),
    inLanguage: "en",
  };
  if (published) data.datePublished = published;
  if (modified) data.dateModified = modified;
  if (post.tags.length) data.keywords = post.tags.join(", ");
  if (post.canonical_url) data.isBasedOn = post.canonical_url;
  return <Ld data={data} />;
}

export function BlogBreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
      }}
    />
  );
}

export function BlogIndexSchema({ posts }: { posts: BlogPost[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${SITE_NAME} Blog`,
        description: "Practical articles on Claude, Claude Code, MCP servers, Skills and Agents.",
        url: `${SITE_URL}/blog`,
        publisher,
        blogPost: posts.slice(0, 20).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: postUrl(post.id),
          ...(isoDate(post.published_at) ? { datePublished: isoDate(post.published_at) } : {}),
          author: { "@type": post.author_id ? "Person" : "Organization", name: post.author },
        })),
      }}
    />
  );
}
