import Link from "next/link";
import Image from "next/image";

function NavItems() {
  const items = [
    { label: "Trips & Tours", href: "/trips-tours" },
    { label: "Certification", href: "/certification" },
    { label: "Dive Sites", href: "/key-largo-dive-sites" },
    { label: "Scuba Gear", href: "/dive-shop-key-largo" },
    { label: "Blog", href: "/scuba-diving-blog" },
    { label: "Contact", href: "/contact-us" },
  ];
  return (
    <div className="hidden md:flex items-center gap-6">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="text-sm font-medium text-foreground/80 hover:text-ocean transition-colors"
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image
        src="https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F078ec59be1b24e338d5a681cb34aad66?format=webp&width=600"
        alt="Key Largo Scuba Diving Logo"
        width={180}
        height={48}
        className="h-10 w-auto"
      />
      <span className="sr-only">Key Largo Scuba Diving</span>
    </Link>
  );
}

function HeaderA() {
  return (
    <header className="w-full border rounded-xl bg-white shadow-sm">
      <div className="px-4 md:px-6">
        <div className="h-16 flex items-center justify-between">
          <Logo />
          <NavItems />
          <div className="flex items-center gap-3">
            <a
              href="tel:305-391-4040"
              className="hidden md:inline text-sm text-foreground/70 hover:text-foreground"
            >
              (305) 391-4040
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
            >
              📅 Book Now
            </a>
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border"
              aria-label="Open menu"
            >
              <span className="text-lg" aria-hidden>
                ≡
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderB() {
  return (
    <header className="w-full border rounded-xl bg-gradient-to-br from-white to-ocean/5">
      <div className="px-4 md:px-6 pt-4">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
        <div className="mt-3 flex items-center justify-center">
          <NavItems />
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 pb-4">
          <a
            href="tel:305-391-4040"
            className="inline-flex items-center gap-2 rounded-md border border-ocean px-4 py-2 text-sm font-medium text-ocean hover:bg-ocean hover:text-white"
          >
            📞 (305) 391-4040
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
          >
            📅 Book Your Trip
          </a>
        </div>
      </div>
    </header>
  );
}

function HeaderC() {
  return (
    <header className="w-full rounded-xl overflow-hidden border">
      <div className="bg-ocean text-white text-xs md:text-sm py-2 px-4 text-center">
        4.9/5 rating • Free cancellations up to 24h • Daily departures
      </div>
      <div className="bg-white px-4 md:px-6">
        <div className="h-16 flex items-center justify-between">
          <Logo />
          <NavItems />
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:305-391-4040"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Call (305) 391-4040
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Check Availability
            </a>
          </div>
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border"
            aria-label="Open menu"
          >
            <span className="text-lg" aria-hidden>
              ≡
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderD() {
  return (
    <header className="w-full border rounded-xl bg-white">
      <div className="px-4 md:px-6">
        <div className="h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Trips", href: "/trips-tours" },
              { label: "Certification", href: "/certification" },
              { label: "Dive Sites", href: "/key-largo-dive-sites" },
              { label: "Gear", href: "/dive-shop-key-largo" },
              { label: "Blog", href: "/scuba-diving-blog" },
            ].map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="relative pb-1 text-sm font-medium text-foreground/80 hover:text-ocean transition-colors group"
              >
                {it.label}
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-ocean transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/contact-us"
              className="hidden md:inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              Contact
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
            >
              Book
            </a>
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border"
              aria-label="Open menu"
            >
              <span className="text-lg" aria-hidden>
                ≡
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function HeaderPreviewsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 space-y-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Header Designs – Dev Preview
          </h1>
          <p className="text-muted-foreground mt-1">
            Four distinct header concepts for review.
          </p>
        </div>

        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Design A: Classic</h2>
            <HeaderA />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Design B: Centered</h2>
            <HeaderB />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Design C: Announcement + Slim
            </h2>
            <HeaderC />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Design D: Minimal Underline
            </h2>
            <HeaderD />
          </div>
        </section>

        <div className="pt-6 text-sm text-muted-foreground">
          Static previews for visual review.
        </div>
      </div>
    </div>
  );
}
