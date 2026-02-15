import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import BlogDetailClient from "./BlogDetailClient";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  seo_description?: string;
  published_at?: string;
  tags: string[];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchApi<BlogPost>(`/blog/${slug}`);
  if (!post) return { title: "Article Not Found" };

  const description = post.seo_description || post.content.substring(0, 155);

  return {
    title: post.title,
    description,
    openGraph: {
      title: `${post.title} | Claude Directory`,
      description,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchApi<BlogPost>(`/blog/${slug}`);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

  return (
    <>
      {post && (
        <>
          <ArticleSchema
            title={post.title}
            description={post.seo_description || post.content.substring(0, 155)}
            url={`${SITE_URL}/blog/${slug}`}
            author={post.author}
            datePublished={post.published_at || ""}
          />
          <BreadcrumbSchema
            items={[
              { name: "Blog", url: `${SITE_URL}/blog` },
              { name: post.title, url: `${SITE_URL}/blog/${slug}` },
            ]}
          />
        </>
      )}
      <BlogDetailClient />
    </>
  );
}
