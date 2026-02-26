import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getCategories } from "@/lib/blog";
import { canonicalPath } from "@/lib/seo";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Blog",
  description: "Frame control tips, group photo psychology, and product updates.",
  alternates: { canonical: canonicalPath("/blog") },
};

type Props = { searchParams: Promise<{ category?: string }> | { category?: string } };

async function resolveSearchParams(searchParams: Props["searchParams"]) {
  if (searchParams && typeof (searchParams as Promise<unknown>).then === "function") {
    return await (searchParams as Promise<{ category?: string }>);
  }
  return (searchParams as { category?: string }) ?? {};
}

export default async function BlogListPage({ searchParams }: Props) {
  const { category } = await resolveSearchParams(searchParams);
  const allPosts = getAllPosts();
  const categories = getCategories();
  const posts = category
    ? allPosts.filter((p) => p.category && p.category === category)
    : allPosts;

  return (
    <main className="min-h-[calc(100vh-65px)] py-16">
      <Container>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-4 text-lg text-zinc-400">
          Frame control tips, group photo psychology, and updates.
        </p>
        {categories.length > 0 && (
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter by category">
            <Link
              href="/blog"
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                !category
                  ? "bg-cyan-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  category === cat
                    ? "bg-cyan-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {cat}
              </Link>
            ))}
          </nav>
        )}
        <ul className="mt-12 space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <article>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-zinc-700"
                >
                  <time
                    dateTime={post.datePublished}
                    className="text-sm text-zinc-500"
                  >
                    {post.datePublished}
                  </time>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-zinc-400">{post.description}</p>
                </Link>
              </article>
            </li>
          ))}
        </ul>
        {posts.length === 0 && (
          <p className="mt-12 text-zinc-500">No posts yet.</p>
        )}
      </Container>
    </main>
  );
}
