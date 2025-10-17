"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need to be an experienced swimmer?",
    a: "No. Every trip includes a friendly safety briefing, tips for first‑timers, and optional flotation aids like snorkel vests and noodles.",
  },
  {
    q: "What should I bring?",
    a: "Swimsuit, towel, reef‑safe sunscreen, sunglasses, and a hat. We provide sanitized mask, snorkel, fins, and fresh‑water rinse.",
  },
  {
    q: "What’s the best time of day?",
    a: "Mornings often have calmer seas and clearer visibility, though afternoons can be excellent too. We’ll choose the best reef sites on the day.",
  },
  {
    q: "Can kids join?",
    a: "Yes—families are welcome. Our crew specializes in creating fun, safe experiences for all ages. Life jackets and flotation are available.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Key Largo Snorkeling FAQ</h2>
          <p className="text-muted-foreground">Helpful answers before you book</p>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm">
          <Accordion type="single" collapsible className="divide-y">
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="px-6">
                <AccordionTrigger className="text-left text-base md:text-lg py-5">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
