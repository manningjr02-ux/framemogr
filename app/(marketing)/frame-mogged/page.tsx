import type { Metadata } from "next";
import Link from "next/link";
import { canonicalPath, websiteJsonLd, buildFaqPageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Container from "@/components/Container";
import InternalLinks from "@/components/InternalLinks";

export const metadata: Metadata = {
  title: "What Is Frame Mogging? Complete Guide (2026 Trend Explained)",
  description:
    "What is frame mogging? Learn the meaning, TikTok origin, psychology, and how to avoid getting frame mogged in photos. Complete 2026 guide.",
  alternates: { canonical: canonicalPath("/frame-mogged") },
  openGraph: {
    title: "What Is Frame Mogging? Complete Guide (2026 Trend Explained)",
    description:
      "What is frame mogging? Learn the meaning, TikTok origin, psychology, and how to avoid getting frame mogged in photos. Complete 2026 guide.",
    url: canonicalPath("/frame-mogged"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is Frame Mogging? Complete Guide (2026 Trend Explained)",
    description:
      "What is frame mogging? Learn the meaning, TikTok origin, psychology, and how to avoid getting frame mogged in photos. Complete 2026 guide.",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "What Is Frame Mogging? Complete Guide (2026 Trend Explained)",
  description:
    "What is frame mogging? Learn the meaning, TikTok origin, psychology, and how to avoid getting frame mogged in photos. Complete 2026 guide.",
  url: canonicalPath("/frame-mogged"),
  publisher: websiteJsonLd.publisher,
};

const faqs = [
  {
    question: "What does frame mogged mean?",
    answer:
      "It means someone visually dominates you in structure and presence, especially in photos.",
  },
  {
    question: "Is frame mogging only about height?",
    answer:
      "No. Height helps, but shoulder width, posture, and proportions matter just as much.",
  },
  {
    question: "Can short guys frame mog?",
    answer:
      "Yes. A shorter person with strong proportions and posture can out-dominant a taller but narrow or slouched person.",
  },
  {
    question: "Is frame mogging scientific?",
    answer:
      "It's rooted in evolutionary psychology and visual perception science, but the internet exaggerates it for meme value.",
  },
  {
    question: "How do I know if I get frame mogged?",
    answer:
      "Compare your shoulder width, posture, and positioning relative to others in photos — or use a structured analysis tool like the Frame Mog Calculator.",
  },
];

const relatedPosts = [
  { slug: "frame-mog-meaning", title: "Frame Mog Meaning" },
  { slug: "frame-mog-vs-looksmaxxing", title: "Frame Mog vs Looksmaxxing" },
  { slug: "how-to-frame-mog-in-photos", title: "How to Frame Mog in Photos" },
  { slug: "frame-mog-gym-routine", title: "Frame Mog Gym Routine" },
  { slug: "best-poses-for-frame-dominance", title: "Best Poses for Frame Dominance" },
];

export default function FrameMoggedPage() {
  const faqSchema = buildFaqPageJsonLd(faqs);

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <main className="min-h-[calc(100vh-65px)] py-16">
        <Container className="max-w-3xl">
          <article className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              What Is Frame Mogging? (Complete Guide 2026)
            </h1>

            <p className="lead mt-6 text-lg text-zinc-300">
              Frame mogging is one of those internet terms that sounds niche… until you realize it explains something you&apos;ve noticed your entire life.
            </p>

            <p className="text-zinc-400">
              You&apos;ve seen it in group photos.
              <br />
              You&apos;ve felt it standing next to someone.
              <br />
              You&apos;ve probably been on both sides of it.
            </p>

            <p className="text-zinc-400">
              In simple terms:
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-300">Frame mogging</strong> happens when someone&apos;s body structure, posture, and physical &quot;frame&quot; makes everyone next to them look smaller, narrower, or less dominant in comparison.
            </p>

            <p className="text-zinc-400">
              It&apos;s not about face attractiveness.
              <br />
              It&apos;s not even strictly about height.
              <br />
              It&apos;s about presence.
            </p>

            <p className="text-zinc-400">
              And in 2026, it&apos;s become a full-blown TikTok and looksmaxxing conversation.
            </p>

            <h2 id="definition" className="mt-12 text-2xl font-bold text-white">
              Definition: What Does &quot;Frame Mogged&quot; Mean?
            </h2>

            <p className="text-zinc-400">
              To be &quot;frame mogged&quot; means:
            </p>

            <p className="text-zinc-400">
              You are visually outclassed in a photo or real-life setting because someone&apos;s physical frame dominates yours.
            </p>

            <p className="text-zinc-400">
              The word &quot;mog&quot; comes from internet slang meaning to outdo, overpower, or visually dominate someone.
            </p>

            <p className="text-zinc-400">
              So when someone says:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>&quot;Bro got frame mogged.&quot;</li>
              <li>&quot;He&apos;s mogging the whole group.&quot;</li>
              <li>&quot;That&apos;s frame dominance.&quot;</li>
            </ul>

            <p className="text-zinc-400">
              They&apos;re talking about structural presence.
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Broad shoulders.</li>
              <li>Long clavicles.</li>
              <li>Tall posture.</li>
              <li>Proportions that command visual attention.</li>
            </ul>

            <p className="text-zinc-400">
              If someone stands next to a person with a wider shoulder span, better posture, and stronger upper-body proportions, the contrast alone can make them look smaller — even if they&apos;re objectively attractive.
            </p>

            <p className="text-zinc-400">
              That contrast is frame mogging.
            </p>

            <h2 id="origin" className="mt-12 text-2xl font-bold text-white">
              Where Did Frame Mogging Come From?
            </h2>

            <p className="text-zinc-400">
              The term exploded on TikTok in late 2024 and early 2025, but the roots go deeper into:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Looksmaxxing communities</li>
              <li>Masculine aesthetic forums</li>
              <li>Fitness transformation content</li>
              <li>&quot;Before vs After&quot; dominance comparisons</li>
            </ul>

            <p className="text-zinc-400">
              TikTok accelerated it because:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Group photos amplify contrast.</li>
              <li>Viral edits highlight shoulder width differences.</li>
              <li>Gen Z loves micro-analyzing social hierarchies.</li>
            </ul>

            <p className="text-zinc-400">
              You&apos;ll often see captions like:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>&quot;He didn&apos;t lose aura, he got frame mogged.&quot;</li>
              <li>&quot;Never stand next to your tall broad friend.&quot;</li>
              <li>&quot;Clavicle width decides everything.&quot;</li>
            </ul>

            <p className="text-zinc-400">
              It&apos;s half meme. Half psychology.
              <br />
              But visually? It&apos;s real.
            </p>

            <h2 id="frame-vs-face" className="mt-12 text-2xl font-bold text-white">
              Frame vs Face: Why Frame Mogging Matters
            </h2>

            <p className="text-zinc-400">
              This is where it gets interesting.
            </p>

            <p className="text-zinc-400">
              Most people assume attractiveness = face.
              <br />
              But in group dynamics, especially in photos, frame often beats face.
            </p>

            <p className="text-zinc-400">
              Why?
            </p>

            <p className="text-zinc-400">
              Because:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Frame is perceived instantly.</li>
              <li>Frame affects how clothes fit.</li>
              <li>Frame determines silhouette.</li>
              <li>Frame creates contrast.</li>
            </ul>

            <p className="text-zinc-400">
              You could have a strong face, but if you&apos;re standing next to someone with:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>2-inch wider shoulder span</li>
              <li>Taller posture</li>
              <li>Larger ribcage structure</li>
              <li>Better V-taper</li>
            </ul>

            <p className="text-zinc-400">
              You might look smaller, even if your facial features are stronger.
            </p>

            <p className="text-zinc-400">
              This is why &quot;frame mogged&quot; has become a dominant conversation in:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Gym communities</li>
              <li>College social scenes</li>
              <li>Fraternity culture</li>
              <li>Transformation TikTok</li>
            </ul>

            <p className="text-zinc-400">
              It&apos;s not about being ugly.
              <br />
              It&apos;s about relative structure.
            </p>

            <h2 id="trending" className="mt-12 text-2xl font-bold text-white">
              Why Frame Mogging Is Trending in 2026
            </h2>

            <p className="text-zinc-400">
              There are 4 reasons this trend exploded:
            </p>

            <h3 id="trending-1" className="mt-6 text-xl font-semibold text-white">
              1. TikTok Visual Culture
            </h3>
            <p className="text-zinc-400">
              Group photo edits and side-by-side comparisons highlight frame differences instantly.
            </p>

            <h3 id="trending-2" className="mt-6 text-xl font-semibold text-white">
              2. Fitness Awareness
            </h3>
            <p className="text-zinc-400">
              More young men are training shoulders and upper back specifically to improve visual dominance.
            </p>

            <h3 id="trending-3" className="mt-6 text-xl font-semibold text-white">
              3. Height Obsession Shift
            </h3>
            <p className="text-zinc-400">
              Instead of only focusing on height, people are realizing shoulder width and posture can compensate heavily.
            </p>

            <h3 id="trending-4" className="mt-6 text-xl font-semibold text-white">
              4. Social Hierarchy Awareness
            </h3>
            <p className="text-zinc-400">
              Gen Z openly talks about: Aura, Presence, Dominance energy, &quot;Main character&quot; positioning. Frame mogging fits perfectly into that conversation.
            </p>

            <h2 id="psychology" className="mt-12 text-2xl font-bold text-white">
              The Psychology Behind Frame Dominance
            </h2>

            <p className="text-zinc-400">
              Humans are wired to read silhouettes fast.
            </p>

            <p className="text-zinc-400">
              From an evolutionary standpoint:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Broader shoulders signal strength.</li>
              <li>Upright posture signals confidence.</li>
              <li>Larger upper-body proportions signal capability.</li>
            </ul>

            <p className="text-zinc-400">
              Your brain processes these cues before facial details.
            </p>

            <p className="text-zinc-400">
              That&apos;s why someone can walk into a room and feel dominant without saying anything.
              <br />
              Frame affects subconscious perception.
              <br />
              And in group photos, that perception becomes frozen forever.
            </p>

            <h2 id="causes" className="mt-12 text-2xl font-bold text-white">
              What Causes Someone to Get Frame Mogged?
            </h2>

            <p className="text-zinc-400">
              You&apos;re more likely to get frame mogged if:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>You have narrow shoulders relative to peers.</li>
              <li>You slouch.</li>
              <li>You stand too close to someone taller.</li>
              <li>You angle your body inward instead of outward.</li>
              <li>You wear clothes that compress your upper body visually.</li>
            </ul>

            <p className="text-zinc-400">
              It&apos;s rarely about genetics alone.
              <br />
              Posture alone can change the outcome dramatically.
            </p>

            <h2 id="examples" className="mt-12 text-2xl font-bold text-white">
              Real Examples of Frame Mogging
            </h2>

            <p className="text-zinc-400">
              Common scenarios:
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-300">Example 1:</strong> Two friends. Same height. One trains lateral delts and upper back. One doesn&apos;t. The shoulder width difference makes one look significantly more dominant.
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-300">Example 2:</strong> A shorter guy stands slightly forward and squared to camera. A taller guy slouches behind him. The shorter guy appears larger in frame.
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-300">Example 3:</strong> A group photo where one person is centered and upright. Everyone else angles inward. Instant frame hierarchy.
            </p>

            <p className="text-zinc-400">
              This is why positioning matters.
            </p>

            <p className="text-zinc-400">
              If you want analysis on your own photo, try the{" "}
              <Link href="/frame-mog-calculator" className="text-cyan-400 hover:underline">
                Frame Mog Calculator
              </Link>
              .
            </p>

            <h2 id="meme" className="mt-12 text-2xl font-bold text-white">
              Is Frame Mogging Just a Meme?
            </h2>

            <p className="text-zinc-400">
              No — but it&apos;s exaggerated online.
            </p>

            <p className="text-zinc-400">
              Yes, TikTok dramatizes it.
              <br />
              Yes, some edits are intentionally overdone.
              <br />
              But the core concept? Visual dominance through structure is real.
            </p>

            <p className="text-zinc-400">
              It&apos;s why:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Tailors widen shoulders in suits.</li>
              <li>Military uniforms emphasize upper body.</li>
              <li>Bodybuilders train delts aggressively.</li>
            </ul>

            <p className="text-zinc-400">
              Frame isn&apos;t random. It&apos;s structural.
            </p>

            <h2 id="improve" className="mt-12 text-2xl font-bold text-white">
              Can You Improve Your Frame?
            </h2>

            <p className="text-zinc-400">
              Yes.
            </p>

            <p className="text-zinc-400">
              Even if your bone structure is fixed, you can improve:
            </p>

            <ul className="list-disc pl-6 text-zinc-400">
              <li>Posture</li>
              <li>Lateral deltoid development</li>
              <li>Upper back thickness</li>
              <li>Waist-to-shoulder ratio</li>
              <li>Camera positioning</li>
              <li>Clothing structure</li>
            </ul>

            <p className="text-zinc-400">
              Frame mogging isn&apos;t a life sentence.
              <br />
              It&apos;s awareness. And awareness is leverage.
            </p>

            <p className="text-zinc-400">
              For deeper breakdowns, explore:{" "}
              <Link href="/blog/how-to-frame-mog-in-photos" className="text-cyan-400 hover:underline">
                How to frame mog in photos
              </Link>
              {" "}and{" "}
              <Link href="/blog/best-poses-for-frame-dominance" className="text-cyan-400 hover:underline">
                Best poses for frame dominance
              </Link>
              .
            </p>

            <h2 id="vs-looksmaxxing" className="mt-12 text-2xl font-bold text-white">
              Frame Mogging vs Looksmaxxing
            </h2>

            <p className="text-zinc-400">
              Looksmaxxing focuses on: Skin, Jawline, Grooming, Symmetry.
            </p>

            <p className="text-zinc-400">
              Frame mogging focuses on: Proportions, Structure, Silhouette, Relative size.
            </p>

            <p className="text-zinc-400">
              They overlap, but they&apos;re not the same.
              <br />
              Frame can elevate average facial features. A strong face with weak frame can lose contrast battles.
            </p>

            <p className="text-zinc-400">
              We break this down fully here:{" "}
              <Link href="/blog/frame-mog-vs-looksmaxxing" className="text-cyan-400 hover:underline">
                Frame mog vs looksmaxxing
              </Link>
              .
            </p>

            <h2 id="future" className="mt-12 text-2xl font-bold text-white">
              Why This Topic Will Only Grow
            </h2>

            <p className="text-zinc-400">
              As AI photo analysis tools become more common, people will increasingly want objective breakdowns of: Presence, Symmetry, Structure, Proportional dominance.
            </p>

            <p className="text-zinc-400">
              That&apos;s why tools like the{" "}
              <Link href="/frame-mog-calculator" className="text-cyan-400 hover:underline">
                Frame Mog Calculator
              </Link>
              {" "}are becoming popular.
            </p>

            <p className="text-zinc-400">
              The conversation is shifting from &quot;Am I attractive?&quot; to: &quot;Do I dominate the frame?&quot;
              <br />
              That&apos;s a different question.
            </p>

            <h2 id="faq" className="mt-12 text-2xl font-bold text-white">
              Frequently Asked Questions
            </h2>

            <dl className="mt-6 space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-zinc-300">{faq.question}</dt>
                  <dd className="mt-1 text-zinc-400">{faq.answer}</dd>
                </div>
              ))}
            </dl>

            <h2 id="final" className="mt-12 text-2xl font-bold text-white">
              Final Thoughts
            </h2>

            <p className="text-zinc-400">
              Frame mogging isn&apos;t about insecurity.
              <br />
              It&apos;s about understanding how visual hierarchy works.
            </p>

            <p className="text-zinc-400">
              You don&apos;t need to obsess over it. But if you care about: Photos, Social presence, Dating apps, Confidence — it&apos;s worth understanding.
            </p>

            <p className="text-zinc-400">
              Because in 2026, presence is visual.
              <br />
              And the frame sets the tone.
            </p>

            <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="text-xl font-semibold text-white">Try the calculator</h2>
              <p className="mt-2 text-zinc-400">
                Upload a group photo, pick yourself, and get your frame dominance score and tips.
              </p>
              <Link
                href="/upload"
                className="mt-4 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
              >
                Get started
              </Link>
            </section>

            <section className="mt-12">
              <InternalLinks
                relatedSlugs={relatedPosts.map((p) => p.slug)}
                relatedTitles={Object.fromEntries(relatedPosts.map((p) => [p.slug, p.title]))}
              />
            </section>
          </article>
        </Container>
      </main>
    </>
  );
}
