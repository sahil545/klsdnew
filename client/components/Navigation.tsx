"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HOME_IMAGES } from "../../lib/generated/home-images";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

type BlogNavPost = {
  id: string;
  title: string;
  href: string;
  excerpt: string | null;
  publishedAt: string | null;
};

type NavigationProps = {
  initialPosts?: BlogNavPost[];
  disableLiveFetch?: boolean;
};

const FEATURED_FALLBACK_POSTS: BlogNavPost[] = [
  {
    id: "christ-of-the-abyss",
    title: "Christ of the Abyss Statue Snorkeling Tour",
    href: "/christ-of-the-abyss-statue-snorkeling-key-largo/",
    excerpt: "Snorkel over Key Largo's iconic underwater statue on a guided small-group trip.",
    publishedAt: null,
  },
  {
    id: "key-largo-reef-dives",
    title: "Key Largo Reef Dive Trips",
    href: "/key-largo-reef-dive-trips/",
    excerpt: "Daily charters to Molasses, French Reef, and more vibrant coral systems.",
    publishedAt: null,
  },
  {
    id: "discover-scuba-diving",
    title: "Discover Scuba Diving in Key Largo",
    href: "/scuba-certification-courses-florida-keys/discover-scuba-diving-key-largo/",
    excerpt: "Beginner-friendly pool session plus two reef dives with a PADI pro.",
    publishedAt: null,
  },
  {
    id: "snorkeling-tours",
    title: "Key Largo Snorkeling Tours",
    href: "/key-largo-snorkeling-tours/",
    excerpt: "Glass-calm reefs, family-ready boats, and gear included on every outing.",
    publishedAt: null,
  },
];

const sanitizeImageUrl = (url: string | null | undefined) => {
  if (!url) return url ?? "";
  if (url.includes("/render/image/")) {
    const base = url.split("?")[0];
    return base.replace("/render/image/", "/object/");
  }
  return url;
};

export function Navigation({
  initialPosts = [],
  disableLiveFetch = false,
}: NavigationProps) {
  const computedLogoUrl = sanitizeImageUrl(HOME_IMAGES.logo);
  const computedLogoAlt = "Key Largo Scuba Diving Logo";
  const computedLogoTitle = "Key Largo Scuba Diving Logo";

  const [posts, setPosts] = useState<BlogNavPost[]>(
    initialPosts.length ? initialPosts : FEATURED_FALLBACK_POSTS,
  );
  const [blogStatus, setBlogStatus] = useState<{
    fromCache: boolean;
    error?: string;
  } | null>(initialPosts.length ? null : null);

  useEffect(() => {
    if (initialPosts.length) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    const storageKey = "nav_blog_posts_v2";
    const isPreviewHost =
      disableLiveFetch ||
      window.location.hostname.endsWith(".fly.dev") ||
      Boolean((window as any).__FULLSTORY) ||
      /fullstory/i.test(String(window.fetch));

    // Hydrate from cache immediately (if present)
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.items) && !cancelled && parsed.items.length) {
          setPosts((current) => (current.length ? current : parsed.items));
          setBlogStatus({ fromCache: true });
        }
      }
    } catch {}

    if (isPreviewHost) {
      setPosts((current) =>
        current.length ? current : FEATURED_FALLBACK_POSTS,
      );
      setBlogStatus((s) => ({
        fromCache: Boolean(s?.fromCache || initialPosts.length > 0),
        error: "Live blog feed disabled in preview environment.",
      }));
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch("/api/blog/nav?limit=30", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as
          | BlogNavPost[]
          | { items?: BlogNavPost[] };
        const unnormalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];
        const items = (unnormalized || [])
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const title =
              typeof item.title === "string" ? item.title.trim() : "";
            const href = typeof item.href === "string" ? item.href.trim() : "";
            if (!title || !href) return null;
            return {
              id: String((item as BlogNavPost).id || href),
              title,
              href,
              excerpt:
                typeof item.excerpt === "string" && item.excerpt.trim().length
                  ? item.excerpt.trim()
                  : null,
              publishedAt:
                typeof item.publishedAt === "string" &&
                item.publishedAt.trim().length
                  ? item.publishedAt
                  : null,
            } satisfies BlogNavPost;
          })
          .filter((item): item is BlogNavPost => Boolean(item));
        if (!cancelled && items.length) {
          setPosts(items);
          setBlogStatus(null);
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ updatedAt: Date.now(), items }),
            );
          } catch {}
        } else if (!cancelled && !items.length) {
          setPosts((current) =>
            current.length ? current : FEATURED_FALLBACK_POSTS,
          );
        }
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!cancelled) {
          setBlogStatus((s) => ({
            fromCache: !!s?.fromCache,
            error:
              "Live blog feed unavailable. Showing cached posts if available.",
          }));
          setPosts((current) =>
            current.length ? current : FEATURED_FALLBACK_POSTS,
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [disableLiveFetch, initialPosts.length]);

  const navItems = [
    { label: "Trips & Tours", href: "/trips-tours" },
    {
      label: "Certification",
      href: "/scuba-certification-courses-florida-keys",
    },
    { label: "Dive Sites", href: "/key-largo-dive-sites" },
    { label: "Scuba Gear", href: "/dive-shop-key-largo" },
    { label: "Blog", href: "/scuba-diving-blog" },
    { label: "Contact", href: "/contact-us" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement bar */}
      <div className="bg-ocean text-white text-xs md:text-sm py-2 px-4 text-center">
        4.9/5 rating • Free cancellations up to 24h • Daily departures
      </div>

      {/* Slim nav */}
      <div className="bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-20 md:h-24 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={computedLogoUrl}
                alt={computedLogoAlt}
                title={computedLogoTitle}
                width={240}
                height={80}
                loading="eager"
                className="h-12 md:h-16 w-auto select-none"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <span className="sr-only">Key Largo Scuba Diving</span>
            </Link>

            {/* Desktop nav with mega menu */}
            <div className="hidden md:flex items-center gap-4">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent shadow-none text-foreground/80 hover:text-ocean">
                      Trips & Tours
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-6 p-6 md:w-[700px] lg:w-[900px] lg:grid-cols-3 bg-white rounded-md border shadow-xl">
                        <div className="col-span-2 grid grid-cols-2 gap-4 md:grid-cols-3">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/key-largo-dive-trips/"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                All Key Largo Dive Trips
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Compare every reef, wreck, and night charter.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/key-largo-reef-dive-trips/"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Reef Dives
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Shallow reefs, vibrant coral gardens.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/key-largo-wreck-dive-trips/"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Wreck Dives
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Spiegel Grove, Duane, and more.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/key-largo-snorkeling-tours/"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Snorkeling Trips
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Crystal-clear reefs for all ages.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/key-largo-sunset-cruise-snorkeling-florida-keys/"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Sunset Cruise &amp; Snorkel
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Golden hour sail with reef snorkeling.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/trips-tours?categories=private-dive-charters"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Private Dive Charters
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Custom itineraries with your pro.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/trips-tours?categories=night-dive"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Night Dives
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Bioluminescence and nocturnal life.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/trips-tours?categories=private-snorkeling-trips"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Private Snorkeling
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Family-friendly, flexible timing.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/product/key-largo-christ-statue-snorkeling-tour"
                            className="relative block overflow-hidden rounded-lg border"
                          >
                            <div className="p-5">
                              <div className="text-sm font-semibold mb-1">
                                Featured
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                Christ of the Abyss Snorkeling Tour
                              </div>
                              <span className="inline-flex items-center text-coral text-sm font-semibold">
                                From $70 →
                              </span>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Certification mega menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent shadow-none text-foreground/80 hover:text-ocean">
                      Certification
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-6 p-6 md:w-[700px] lg:w-[900px] lg:grid-cols-3 bg-white rounded-md border shadow-xl">
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-certification-courses-florida-keys/discover-scuba-diving-key-largo"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Try Scuba Diving
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Pool training + 2 reef dives.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-certification-courses-florida-keys/open-water-scuba-certification"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Open Water Certification
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Beginner • 3-4 days.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-certification-courses-florida-keys/open-water-referral-dives"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Open Water Referral Dives
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Complete your dives in Key Largo.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-certification-courses-florida-keys/refresher-course"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Refresher Course
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Knock the rust off safely.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-certification-courses-florida-keys/padi-advanced-open-water-diver-certification"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Advanced Open Water
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Go deeper, learn navigation.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-certification-courses-florida-keys/rescue-diver-certification"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                Rescue Diver
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Manage emergencies confidently.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/certification/all-courses"
                              className="group rounded-lg border p-4 hover:bg-accent transition"
                            >
                              <div className="text-sm font-semibold mb-1">
                                All Courses
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Explore every certification.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/scuba-certification-courses-florida-keys"
                            className="relative block overflow-hidden rounded-lg border"
                          >
                            <div className="p-5">
                              <div className="text-sm font-semibold mb-1">
                                Overview
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                All certifications at a glance
                              </div>
                              <span className="inline-flex items-center text-ocean text-sm font-semibold">
                                Browse Certifications →
                              </span>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Blog posts list */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent shadow-none text-foreground/80 hover:text-ocean">
                      Blog
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="p-4 md:w-[700px] lg:w-[900px] bg-white rounded-md border shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-auto">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/scuba-diving-blog"
                              className="group rounded border p-3 hover:bg-accent transition col-span-1 md:col-span-2 lg:col-span-3"
                            >
                              <div className="text-sm font-semibold">
                                All Posts
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Browse every article
                              </p>
                            </Link>
                          </NavigationMenuLink>

                          {blogStatus?.error && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                              {blogStatus.error}
                            </div>
                          )}

                          {posts && posts.length > 0
                            ? posts.map((p) => (
                                <NavigationMenuLink asChild key={p.id}>
                                  <Link
                                    href={p.href}
                                    className="rounded border p-3 hover:bg-accent transition text-sm"
                                  >
                                    {p.title}
                                  </Link>
                                </NavigationMenuLink>
                              ))
                            : [
                                {
                                  href: "/scuba-diving-101/is-scuba-diving-dangerous/",
                                  title: "Is Scuba Diving Dangerous?",
                                },
                                {
                                  href: "/snorkeling-101/what-to-wear-snorkeling-in-key-largo/",
                                  title: "What to Wear Snorkeling in Key Largo",
                                },
                                {
                                  href: "/scuba-diving-101/how-to-start-scuba-diving/",
                                  title: "How to Start Scuba Diving",
                                },
                              ].map((f, i) => (
                                <NavigationMenuLink asChild key={`fb-${i}`}>
                                  <Link
                                    href={f.href}
                                    className="rounded border p-3 hover:bg-accent transition text-sm"
                                  >
                                    {f.title}
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {navItems
                    .filter(
                      (n) =>
                        !["Trips & Tours", "Certification", "Blog"].includes(
                          n.label,
                        ),
                    )
                    .map((item) => (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="px-5 py-2 text-base font-semibold text-foreground/80 hover:text-ocean"
                          >
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="tel:305-391-4040"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                Call (305) 391-4040
              </a>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Dive Packages
              </button>
            </div>

            {/* Mobile menu placeholder */}
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border"
              aria-label="Open menu"
              type="button"
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

export default Navigation;
