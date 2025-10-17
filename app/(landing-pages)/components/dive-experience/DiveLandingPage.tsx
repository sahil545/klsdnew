import Navigation from "../../../../client/components/Navigation";
import Footer from "../../../../client/components/Footer";

import { ContactSection } from "./ContactSection";
import { FAQSection } from "./FAQSection";
import { GallerySection } from "./GallerySection";
import { Hero } from "./Hero";
import { HighlightsSection } from "./HighlightsSection";
import { ItinerarySection } from "./ItinerarySection";
import { QuickInfo } from "./QuickInfo";
import type { DiveLandingContent } from "./types";
import { ValuePropsSection } from "./ValuePropsSection";
import { WordPressSections } from "./WordPressSections";

interface DiveLandingPageProps {
  data: DiveLandingContent;
}

export function DiveLandingPage({ data }: DiveLandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main>
        <Hero data={data.hero} />
        <QuickInfo items={data.quickInfo} />
        <HighlightsSection
          items={data.featuredList}
          title="What makes this trip unforgettable"
          subtitle="Hand-selected highlights directly from our WordPress content, translated into a conversion-ready layout."
        />
        <ValuePropsSection cards={data.valueProps} />
        <ItinerarySection
          title={data.itinerary.title}
          description={data.itinerary.description}
          steps={data.itinerary.steps}
        />
        <GallerySection images={data.gallery} />
        <WordPressSections sections={data.wordpressSections} limit={4} />
        <FAQSection items={data.faq} />
        <ContactSection data={data.contact} />
      </main>
      <Footer />
    </div>
  );
}
