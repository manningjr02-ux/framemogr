import Container from "@/components/Container";

export default function SocialProofBar() {
  return (
    <section className="border-y border-zinc-800/80 py-4">
      <Container>
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-zinc-400 sm:flex-row sm:gap-4">
          <span>12,384 photos ranked this week.</span>
          <span className="hidden text-zinc-600 sm:inline">•</span>
          <span>Built for group chats, frat houses, and photo dumps.</span>
        </div>
      </Container>
    </section>
  );
}
