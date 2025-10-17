import Image from "next/image";

import type { GalleryImage } from "./types";

interface GallerySectionProps {
  images: GalleryImage[];
}

export function GallerySection({ images }: GallerySectionProps) {
  if (!images.length) return null;

  return (
    <section className="bg-slate-900 py-20">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <div className="mb-10 flex flex-col gap-3 text-white">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Photo Highlights
          </span>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            See the reefs, wrecks, and sunsets before you dive in
          </h2>
          <p className="max-w-2xl text-sm text-white/70">
            Every image is sourced directly from the original WordPress page so guests see the authentic experience they are booking.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <figure
              key={image.src}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={640}
                height={420}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-xs font-medium uppercase tracking-wide text-white/80">
                {image.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
