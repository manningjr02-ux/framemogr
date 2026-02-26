/**
 * Technical SEO helpers: canonical URLs, JSON-LD schema.
 * SITE_URL is never localhost so canonicals/sitemap stay prod-safe.
 */

const FALLBACK_SITE_URL = "https://framemogr.com";

function normalizeUrl(url: string): string {
  let u = (url || "").trim().replace(/\/+$/, "");
  if (!u) return FALLBACK_SITE_URL;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  u = u.replace(/^http:\/\//i, "https://");
  try {
    const host = new URL(u).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.endsWith(".local")) {
      return FALLBACK_SITE_URL;
    }
  } catch {
    return FALLBACK_SITE_URL;
  }
  return u;
}

const RAW_SITE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
  FALLBACK_SITE_URL;

export const SITE_URL = normalizeUrl(RAW_SITE_URL);

export function canonicalPath(path: string): string {
  const p = (path || "").trim().replace(/^\/+/, "/").replace(/\/+/g, "/");
  const base = SITE_URL.replace(/\/+$/, "");
  const pathPart = p.startsWith("/") ? p : `/${p}`;
  return `${base}${pathPart}`;
}

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FrameMog",
  url: SITE_URL,
};

export const organizationJsonLd = ORGANIZATION;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FrameMog",
  url: SITE_URL,
  publisher: ORGANIZATION,
};

export type BlogPostingJsonLdMeta = {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  url: string;
  keywords?: string[];
  author?: { name: string; url?: string };
};

export function buildBlogPostingJsonLd(meta: BlogPostingJsonLdMeta): object {
  const author = meta.author
    ? {
        "@type": "Person" as const,
        name: meta.author.name,
        ...(meta.author.url && { url: meta.author.url }),
      }
    : { "@type": "Person" as const, name: "FrameMog" };

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.headline,
    description: meta.description,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    mainEntityOfPage: { "@type": "WebPage" as const, "@id": meta.url },
    author,
    publisher: ORGANIZATION,
    ...(Array.isArray(meta.keywords) &&
      meta.keywords.length > 0 && { keywords: meta.keywords.join(", ") }),
  };
}

export function buildArticleJsonLd(meta: BlogPostingJsonLdMeta): object {
  return {
    ...buildBlogPostingJsonLd(meta),
    "@type": "Article",
  };
}

export type FaqItem = { question: string; answer: string };

/** Returns FAQPage JSON-LD only when there are >= 2 FAQs with non-empty question and answer. */
export function buildFaqPageJsonLd(faqs: FaqItem[]): object | null {
  const valid = (faqs ?? []).filter(
    (f) =>
      typeof f?.question === "string" &&
      f.question.trim() !== "" &&
      typeof f?.answer === "string" &&
      f.answer.trim() !== ""
  );
  if (valid.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.answer.trim() },
    })),
  };
}
