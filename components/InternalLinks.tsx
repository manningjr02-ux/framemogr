import Link from "next/link";

type InternalLinksProps = {
  relatedSlugs?: string[];
  relatedTitles?: Record<string, string>;
  className?: string;
};

const PILLAR = { href: "/frame-mogged", label: "Frame Mogged" };
const CALCULATOR = { href: "/frame-mog-calculator", label: "Frame Mog Calculator" };

export default function InternalLinks({
  relatedSlugs = [],
  relatedTitles = {},
  className = "",
}: InternalLinksProps) {
  return (
    <nav
      aria-label="Related content"
      className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}
    >
      <h2 className="text-lg font-semibold text-white">Explore</h2>
      <ul className="mt-4 flex flex-wrap gap-4">
        <li>
          <Link
            href={PILLAR.href}
            className="text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            {PILLAR.label}
          </Link>
        </li>
        <li>
          <Link
            href={CALCULATOR.href}
            className="text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            {CALCULATOR.label}
          </Link>
        </li>
        {relatedSlugs.map((slug) => (
          <li key={slug}>
            <Link
              href={`/blog/${slug}`}
              className="text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              {relatedTitles[slug] ?? slug}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
