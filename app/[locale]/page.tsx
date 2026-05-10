import Navigation from "@/components/app-navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSolutionSection } from "@/components/landing/problem-solution-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LocaleProp } from "@/types/props";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Separator } from "@/components/ui/separator";

export default function LandingPage({ params }: { params: LocaleProp }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <Navigation />
      <main className="flex flex-col">
        <HeroSection />
        <Separator />
        <FeaturesSection />
        <Separator />
        <ProblemSolutionSection />
        <Separator />
        <CtaSection />
      </main>
    </>
  );
}
