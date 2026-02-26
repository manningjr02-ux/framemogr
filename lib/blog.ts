/**
 * File-based blog: reads content/blog, parses frontmatter, exposes posts.
 * Server-only (uses fs).
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  category?: string;
  keywords?: string[];
  faqs?: Array< { question: string; answer: string } >;
  draft?: boolean;
};

export type Post = PostMeta & {
  slug: string;
  content: string;
};

function toIsoDate(d: string): string {
  if (!d || typeof d !== "string") return new Date().toISOString().slice(0, 10);
  const match = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function parseFrontmatter(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const title = typeof data?.title === "string" ? data.title : slug;
  const description = typeof data?.description === "string" ? data.description : "";
  const datePublished = toIsoDate(data?.datePublished ?? data?.date ?? "");
  const dateModified = toIsoDate(data?.dateModified ?? data?.datePublished ?? data?.date ?? datePublished);
  const category = typeof data?.category === "string" ? data.category : undefined;
  const keywords = Array.isArray(data?.keywords) ? data.keywords.filter((k): k is string => typeof k === "string") : undefined;
  const faqs = Array.isArray(data?.faqs)
    ? data.faqs
        .filter((f): f is { question: string; answer: string } => f && typeof (f as { question?: string }).question === "string" && typeof (f as { answer?: string }).answer === "string")
        .map((f) => ({ question: (f as { question: string }).question, answer: (f as { answer: string }).answer }))
    : undefined;
  const draft = data?.draft === true;

  return {
    slug,
    title,
    description,
    datePublished,
    dateModified,
    category,
    keywords,
    faqs,
    draft,
    content: content?.trim() ?? "",
  };
}

function getSlugFromFilename(name: string): string {
  return name.replace(/\.(md|mdx)$/i, "");
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const names = fs.readdirSync(BLOG_DIR);
  const posts: Post[] = [];
  for (const name of names) {
    if (!/\.(md|mdx)$/i.test(name)) continue;
    const fullPath = path.join(BLOG_DIR, name);
    if (!fs.statSync(fullPath).isFile()) continue;
    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const post = parseFrontmatter(getSlugFromFilename(name), raw);
      if (post.draft) continue;
      posts.push(post);
    } catch {
      continue;
    }
  }
  posts.sort((a, b) => (b.datePublished > a.datePublished ? 1 : -1));
  return posts;
}

/** Unique categories from all non-draft posts, sorted. */
export function getCategories(): string[] {
  const posts = getAllPosts();
  const set = new Set<string>();
  for (const p of posts) {
    if (p.category && p.category.trim()) set.add(p.category.trim());
  }
  return Array.from(set).sort();
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  const names = fs.readdirSync(BLOG_DIR);
  const cleanSlug = slug.replace(/\/|\.\./g, "");
  for (const name of names) {
    if (!/\.(md|mdx)$/i.test(name)) continue;
    if (getSlugFromFilename(name) !== cleanSlug) continue;
    const fullPath = path.join(BLOG_DIR, name);
    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const post = parseFrontmatter(cleanSlug, raw);
      return post;
    } catch {
      return null;
    }
  }
  return null;
}
