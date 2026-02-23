import Hero from "@/components/landing/Hero";
import SocialProofBar from "@/components/landing/SocialProofBar";
import HowItWorks from "@/components/landing/HowItWorks";
import MetricsGrid from "@/components/landing/MetricsGrid";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import ShareCardPreview from "@/components/landing/ShareCardPreview";
import EgoTriggerSection from "@/components/landing/EgoTriggerSection";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <main className="bg-zinc-950">
      <Hero />
      <SocialProofBar />
      <HowItWorks />
      <MetricsGrid />
      <BeforeAfterSection />
      <ShareCardPreview />
      <EgoTriggerSection />
      <FinalCTA />
    </main>
  );
}
