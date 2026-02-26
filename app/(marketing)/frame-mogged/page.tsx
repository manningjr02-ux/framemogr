import type { Metadata } from "next";
import Link from "next/link";
import { canonicalPath, websiteJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Container from "@/components/Container";
import InternalLinks from "@/components/InternalLinks";

export const metadata: Metadata = {
  title: "Frame Mogged",
  description:
    "Get frame-mogged: analyze your group photos for frame control and dominance. See who controls the frame and how to improve.",
  alternates: { canonical: canonicalPath("/frame-mogged") },
  openGraph: {
    title: "Frame Mogged",
    description: "Analyze your group photos for frame control. See who controls the frame.",
    url: canonicalPath("/frame-mogged"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frame Mogged",
    description: "Analyze your group photos for frame control.",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Frame Mogged",
  description: "Get frame-mogged: analyze your group photos for frame control.",
  url: canonicalPath("/frame-mogged"),
  publisher: websiteJsonLd.publisher,
};

export default function FrameMoggedPage() {
  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <main className="min-h-[calc(100vh-65px)] py-16">
        <Container>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Frame Mogged
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Analyze your group photos for frame control. See who dominates the frame and get tactical tips to improve.
          </p>
          <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">How it works</h2>
            <p className="mt-4 text-zinc-400">
              Upload a group photo, pick yourself, and we score everyone&apos;s frame dominance. You get a verdict and actionable tips.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
            >
              Get started
            </Link>
          </section>
          <section className="mt-12">
            <InternalLinks />
          </section>
        </Container>
      </main>
    </>
  );
}
