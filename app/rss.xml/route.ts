import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { canonicalPath, SITE_URL } from "@/lib/seo";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822Date(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toUTCString();
}

export async function GET() {
  const posts = getAllPosts();
  const base = SITE_URL.replace(/\/+$/, "");

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(canonicalPath(`/blog/${post.slug}`))}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822Date(post.datePublished)}</pubDate>
      <guid isPermaLink="true">${escapeXml(canonicalPath(`/blog/${post.slug}`))}</guid>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FrameMog Blog</title>
    <link>${escapeXml(base)}</link>
    <description>Frame control tips, group photo psychology, and product updates.</description>
    <language>en</language>
    <lastBuildDate>${toRfc822Date(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${escapeXml(canonicalPath("/rss.xml"))}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
