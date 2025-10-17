import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TourData } from "../snorkeling-tours-template/data";

interface HeroAltProps {
  data: TourData;
}

export default function HeroAlt({ data }: HeroAltProps) {
  const bg = data.images.hero;
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image src={bg} alt={data.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/20" />
      </div>

      <div className="relative container mx-auto px-4 py-28 md:py-36">
        <div className="max-w-3xl text-white">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-white/15 text-white border-white/20">Snorkeling</Badge>
            <Badge className="bg-coral/80 text-white border-coral/80">Family Friendly</Badge>
            <Badge className="bg-white/15 text-white border-white/20">All Gear Included</Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">{data.name}</h1>
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            Discover crystal‑clear reefs, the famous Christ of the Abyss, and safe, guided trips perfect for all ages.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="#tours">
              <Button className="bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-5 text-base">Browse All Snorkeling Tours</Button>
            </Link>
            <Link href="tel:305-391-4040" className="underline underline-offset-4 text-white/90 hover:text-white">
              Or call (305) 391‑4040
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative gradient border */}
      <div className="h-2 w-full bg-gradient-to-r from-coral via-ocean to-sage" />
    </section>
  );
}
