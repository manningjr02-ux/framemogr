import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { getAllPosts, getPostBySlug, type Post } from "@/lib/blog";
import { canonicalPath, buildBlogPostingJsonLd, buildFaqPageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Container from "@/components/Container";
import InternalLinks from "@/components/InternalLinks";

function toIso(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return new Date().toISOString();
  return `${dateStr}T00:00:00.000Z`;
}

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/#/g, "").trim();
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (id) headings.push({ id, text, level });
    }
  }
  return headings;
}

type Props = { params: Promise<{ slug: string }> | { slug: string } };

async function resolveSlug(params: Props["params"]): Promise<string> {
  return typeof (params as Promise<{ slug: string }>).then === "function"
    ? (await (params as Promise<{ slug: string }>)).slug
    : (params as { slug: string }).slug;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const slug = await resolveSlug(params);
    const post = getPostBySlug(slug);
    if (!post) notFound();
    const canonical = canonicalPath(`/blog/${post.slug}`);
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical },
      openGraph: {
        title: post.title,
        description: post.description,
        url: canonical,
        type: "article",
        publishedTime: toIso(post.datePublished),
        modifiedTime: toIso(post.dateModified),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    notFound();
  }
}

export default async function BlogPostPage({ params }: Props) {
  const slug = await resolveSlug(params);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const related = getRelatedPosts(post, 5);
  const blogJsonLd = buildBlogPostingJsonLd({
    headline: post.title,
    description: post.description,
    datePublished: toIso(post.datePublished),
    dateModified: toIso(post.dateModified),
    url: canonicalPath(`/blog/${post.slug}`),
    keywords: post.keywords,
  });

  const faqJsonLd = buildFaqPageJsonLd(post.faqs ?? []);

  const relatedTitles: Record<string, string> = {};
  related.forEach((p) => {
    relatedTitles[p.slug] = p.title;
  });

  return (
    <>
      <JsonLd data={blogJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <main className="min-h-[calc(100vh-65px)] py-16">
        <Container className="flex gap-12">
          <article className="min-w-0 flex-1">
            <header>
              <time
                dateTime={post.datePublished}
                className="text-sm text-zinc-500"
              >
                {post.dateModified !== post.datePublished
                  ? `Updated ${post.dateModified}`
                  : post.datePublished}
              </time>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-4 text-lg text-zinc-400">{post.description}</p>
              )}
            </header>
            <div className="prose prose-invert mt-10 max-w-none prose-headings:scroll-mt-24">
              <ReactMarkdown
                components={{
                  h2: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    return (
                      <h2 id={id} {...props}>
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    return (
                      <h3 id={id} {...props}>
                        {children}
                      </h3>
                    );
                  },
                  a: ({ href, children, ...props }) => {
                    if (href?.startsWith("/"))
                      return (
                        <Link href={href} className="text-cyan-400 hover:underline" {...props}>
                          {children}
                        </Link>
                      );
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline" {...props}>
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
            <footer className="mt-12 border-t border-zinc-800 pt-8">
              <InternalLinks
                relatedSlugs={related.map((p) => p.slug)}
                relatedTitles={relatedTitles}
              />
            </footer>
          </article>
          {headings.length > 0 && (
            <aside className="hidden w-56 shrink-0 lg:block">
              <h2 className="text-sm font-semibold text-zinc-400">On this page</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="text-zinc-500 hover:text-cyan-400"
                      style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </Container>
      </main>
    </>
  );
}

function getRelatedPosts(post: Post, limit: number): Post[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const byCategory = all.filter((p) => p.category && p.category === post.category);
  const rest = all.filter((p) => !byCategory.includes(p));
  return [...byCategory, ...rest].slice(0, limit);
}
