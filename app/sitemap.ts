import { MetadataRoute } from "next";
import { canonicalPath } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";

/** getAllPosts() already excludes draft: true, so sitemap never includes drafts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: canonicalPath("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: canonicalPath("/frame-mogged"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalPath("/frame-mog-calculator"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalPath("/blog"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const posts = getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: canonicalPath(`/blog/${post.slug}`),
    lastModified: new Date(post.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
