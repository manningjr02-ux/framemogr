import type { Metadata } from "next";
import Link from "next/link";
import { canonicalPath, websiteJsonLd, buildFaqPageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Container from "@/components/Container";
import InternalLinks from "@/components/InternalLinks";

export const metadata: Metadata = {
  title: "Frame Mog Calculator",
  description:
    "Calculate your frame dominance in group photos. Upload a photo, select yourself, and get your frame score and tips.",
  alternates: { canonical: canonicalPath("/frame-mog-calculator") },
  openGraph: {
    title: "Frame Mog Calculator",
    description: "Calculate your frame dominance in group photos.",
    url: canonicalPath("/frame-mog-calculator"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frame Mog Calculator",
    description: "Calculate your frame dominance in group photos.",
  },
};

const calculatorFaqs = [
  {
    question: "What is the Frame Mog Calculator?",
    answer:
      "The Frame Mog Calculator analyzes a group photo you upload, lets you select which person is you, and scores everyone's frame dominance. You get a verdict and tips to improve your presence in the next shot.",
  },
  {
    question: "How do I use it?",
    answer:
      "Upload a group photo, wait for faces to be detected, select yourself by clicking your letter (A, B, C…), then click Analyze My Frame. You'll see your score and recommendations.",
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Frame Mog Calculator",
  description: "Calculate your frame dominance in group photos.",
  url: canonicalPath("/frame-mog-calculator"),
  publisher: websiteJsonLd.publisher,
};

export default function FrameMogCalculatorPage() {
  const faqSchema = buildFaqPageJsonLd(calculatorFaqs);

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <main className="min-h-[calc(100vh-65px)] py-16">
        <Container>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Frame Mog Calculator
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Upload a group photo, select yourself, and get your frame dominance score and tips.
          </p>
          <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">Try it</h2>
            <p className="mt-4 text-zinc-400">
              Use the calculator to see who controls the frame in any group photo.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
            >
              Upload a photo
            </Link>
          </section>
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-white">FAQ</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="font-medium text-zinc-300">What is the Frame Mog Calculator?</dt>
                <dd className="mt-1 text-zinc-400">
                  It analyzes a group photo you upload, lets you select which person is you, and scores everyone&apos;s frame dominance. You get a verdict and tips to improve.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-300">How do I use it?</dt>
                <dd className="mt-1 text-zinc-400">
                  Upload a group photo, select yourself by clicking your letter (A, B, C…), then click Analyze My Frame. You&apos;ll see your score and recommendations.
                </dd>
              </div>
            </dl>
          </section>
          <section className="mt-12">
            <InternalLinks />
          </section>
        </Container>
      </main>
    </>
  );
}
