"use client";

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "../client/components/ui/aspect-ratio";
import {
  FEATURED_GEAR_CATEGORIES as FEATURED_CATEGORIES,
  convertWooToGearItem,
  slugify,
} from "../shared/gear";
import { Navigation } from "../client/components/Navigation";
import { Footer } from "../client/components/Footer";
import { Button } from "../client/components/ui/button";
import { Badge } from "../client/components/ui/badge";
import { Input } from "../client/components/ui/input";
import { Card } from "../client/components/ui/card";
import { Dialog, DialogContent } from "../client/components/ui/dialog";
import Booking from "../client/components/Booking";

import EnhancedCard from "../client/components/EnhancedCard";
import ScrollAnimation from "../client/components/ScrollAnimation";
import { HOME_IMAGES } from "../lib/generated/home-images";

const sanitizeImageUrl = (url: string | null | undefined) => {
  if (!url) return url ?? "";
  if (url.includes("/render/image/")) {
    const base = url.split("?")[0];
    return base.replace("/render/image/", "/object/");
  }
  return url;
};

const HOME_IMAGES_SAFE = Object.fromEntries(
  Object.entries(HOME_IMAGES).map(([key, value]) => [
    key,
    sanitizeImageUrl(value),
  ]),
) as typeof HOME_IMAGES;

import {
  Star,
  Calendar,
  Users,
  Clock,
  MapPin,
  Award,
  Shield,
  Anchor,
  Waves,
  BookOpen,
  UserCheck,
  Fish,
  Ship,
  Moon,
  Target,
  Zap,
  Store,
  Package,
  Truck,
  Settings,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Timer,
  CheckCircle,
  Phone,
  MessageCircle,
  Quote,
} from "lucide-react";

// Base API URL for category products (internal normalized API)
const CATEGORY_API_BASE = "/api/gear?category=";

// Category chips imported from shared/gear

type TripItem = {
  id: number;
  slug?: string;
  title: string;
  category: string;
  price: number;
  duration?: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  permalink?: string;
  features?: string[];
  catSlugs?: string[];
  catNames?: string[];
};

export default function Homepage({
  initialTrips,
  initialFeaturedGear,
  initialActiveGearFilter,
}: {
  initialTrips?: TripItem[];
  initialFeaturedGear?: any[];
  initialActiveGearFilter?: string;
}) {
  const [activeFilter, setActiveFilter] = useState("Beginner");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeAdventureFilter, setActiveAdventureFilter] =
    useState("reef-dives");
  const [activeGearFilter, setActiveGearFilter] = useState(
    initialActiveGearFilter || "Regulators",
  );
  const [featuredGearProducts, setFeaturedGearProducts] = useState<any[]>(
    initialFeaturedGear || [],
  );
  const [loadingFeaturedGear, setLoadingFeaturedGear] = useState(
    !(initialFeaturedGear && initialFeaturedGear.length > 0),
  );
  const [currentGearSlide, setCurrentGearSlide] = useState(0);
  const [adventures, setAdventures] = useState<TripItem[]>(initialTrips || []);
  const [loadingTrips, setLoadingTrips] = useState(
    !initialTrips || initialTrips.length === 0,
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [heroVariant, setHeroVariant] = useState<1 | 2 | 3>(3);
  const [valuePropVariant, setValuePropVariant] = useState<1 | 2 | 3 | 4>(3);
  const [compactReviewIndex, setCompactReviewIndex] = useState(0);
  const promoImg1 = HOME_IMAGES_SAFE.wpTryScuba;
  const promoImg2 = HOME_IMAGES_SAFE.wpDiveInOneDay;
  const proShopBackground = HOME_IMAGES_SAFE.wpDiveShop;

  const openBooking = () => {
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
  };

  const googleReviews = [
    {
      name: "Rob N",
      text: "We did 4 Discover Scuba Diving courses and 2 Refresher Courses. Chad was awesome with our 4 kids. He was fun and enjoyable but also strict and disciplined. He gave my 4 kids the perfect first dive experience.",
    },
    {
      name: "Travis H",
      text: "Had such a great day Diving with KLSD... Beau was an awesome instructor and really made us comfortable on our first dive in the Florida Keys. The whole team was knowledgeable.",
    },
    {
      name: "Beth E",
      text: "Highly recommend for learning to dive. Beau and Rob were kind, patient, and thorough with the training. If I felt I wasn’t proficient at a skill, I was given time and instruction to ensure I was proficient. I learned so much through this experience.",
    },
    {
      name: "Kristen P",
      text: "Finished another beautiful dive at this location! Chad was a very amazing and patient guide! The boat ride was great and the experience Scuba Diving was amazing. Will be coming back for a third time!",
    },
    {
      name: "Peter M",
      text: "I have never left a public review online before, but I feel compelled to let people know how wonderful my dive instructor Erica and the Key Largo Scuba Diving group was in helping this 73 year-old bucket list pursuer from Seattle finally get to discover scuba diving.",
    },
    {
      name: "James C",
      text: "Had an amazing experience getting my open water certification. I had Danny as an instructor and he made it more enjoyable than I ever could’ve imagined. Erica also helped with our class on the first day and was super helpful!",
    },
    {
      name: "Niraj L",
      text: "Had a great time getting my Open Water certification at Key Largo Scuba Diving! Vicky is a fantastic instructor - she made me feel completely at ease and guided me through both the pool learning and ocean dives.",
    },
    {
      name: "Nick H",
      text: "Had a fantastic time getting my open water diver certification with Key Largo Scuba Diving! My instructor Jayme was next level and an amazing scuba teacher. She went above and beyond to insure I was confident in both the pool and ocean",
    },
  ];
  const reviewsRef = React.useRef<HTMLDivElement>(null);
  const scrollReviews = (dir: "left" | "right") => {
    const el = reviewsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Load products for specific category from internal API
  const loadCategoryProducts = async (categoryId: number): Promise<any[]> => {
    const apiUrl = `${CATEGORY_API_BASE}${categoryId}`;
    try {
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.items)) {
          // items are already normalized by /api/gear
          return data.items;
        }
        if (data && Array.isArray(data.products)) return data.products; // legacy fallback
        if (Array.isArray(data)) return data;
      }
    } catch (error) {
      console.warn(
        `Failed to load products for category ${categoryId}:`,
        error,
      );
    }
    return [];
  };

  // Converter imported from shared/gear

  // Initial load for active category if SSR not provided
  useEffect(() => {
    if (initialFeaturedGear && initialFeaturedGear.length > 0) return;
    const loadInitial = async () => {
      try {
        setLoadingFeaturedGear(true);
        const selectedCategory = FEATURED_CATEGORIES.find(
          (cat) => cat.name === activeGearFilter,
        );
        if (!selectedCategory) return;
        const items = await loadCategoryProducts(selectedCategory.id);
        // items are already normalized by /api/gear; just take first 6
        setFeaturedGearProducts(items.slice(0, 6));
      } catch (error) {
        console.warn("Failed to load initial gear products:", error);
        setFeaturedGearProducts([]);
      } finally {
        setLoadingFeaturedGear(false);
      }
    };
    loadInitial();
  }, []);

  // Load products for specific category when filter changes (skip first run if SSR provided)
  useEffect(() => {
    if (activeGearFilter === "All") return; // Don't reload for "All" filter

    // If we already have SSR-initialized products, skip the first effect run
    const skipFirstRun = initialFeaturedGear && initialFeaturedGear.length > 0;
    // Use a ref to ensure we only skip once
    const didInitSSR = (window as any).__klsd_init_gear_ssr__ ?? false;
    if (skipFirstRun && !didInitSSR) {
      (window as any).__klsd_init_gear_ssr__ = true;
      return;
    }

    const loadCategorySpecificProducts = async () => {
      try {
        setLoadingFeaturedGear(true);

        // Find the category ID for the selected filter
        const selectedCategory = FEATURED_CATEGORIES.find(
          (cat) => cat.name === activeGearFilter,
        );

        if (!selectedCategory) {
          console.warn(`Category not found for filter: ${activeGearFilter}`);
          return;
        }

        // Load products from the specific category
        const categoryProducts = await loadCategoryProducts(
          selectedCategory.id,
        );

        // Category API returns normalized items already; just limit
        const limitedProducts = categoryProducts.slice(0, 6);

        // Set the products for this category
        console.log(
          `Loaded ${limitedProducts.length} products for category: ${activeGearFilter}`,
          limitedProducts,
        );
        setFeaturedGearProducts(limitedProducts);
      } catch (error) {
        console.warn(
          `Failed to load products for category ${activeGearFilter}:`,
          error,
        );
        setFeaturedGearProducts([]);
      } finally {
        setLoadingFeaturedGear(false);
      }
    };

    loadCategorySpecificProducts();
  }, [activeGearFilter]);

  // Load trips on client only if no initial SSR data
  useEffect(() => {
    if (initialTrips && initialTrips.length) return;
    let ignore = false;
    async function loadTrips() {
      try {
        const res = await fetch(`/api/trips?limit=100`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const trips: TripItem[] = (data.trips || []).map((t: any) => {
          const catSlugs = (t.categories || []).map((c: any) =>
            (c.slug || "").toLowerCase(),
          );
          const catNames = (t.categories || []).map((c: any) =>
            (c.name || "").toLowerCase(),
          );
          const titleLower = String(t.name || "").toLowerCase();
          const desc = (t.short_description || "").replace(/<[^>]+>/g, "");

          const features: string[] = [];
          const isSnorkel =
            catSlugs.includes("snorkeling-trips") ||
            catNames.some((n: string) => n.includes("snorkel"));
          const isWreck =
            catSlugs.includes("wreck-dives") ||
            catNames.some((n: string) => n.includes("wreck"));
          const isReef =
            catSlugs.includes("reef-dives") ||
            catNames.some((n: string) => n.includes("reef"));
          const isPrivate =
            catSlugs.includes("private-dive-charters") ||
            titleLower.includes("private");
          const isNight =
            catSlugs.includes("night-dive") || titleLower.includes("night");

          if (isSnorkel) {
            features.push("No experience required", "All gear included");
          }
          if (isWreck) {
            features.push("Advanced dive", "2-tank dive");
          }
          if (isReef) {
            features.push("2-tank dive", "Shallow reef sites");
          }
          if (isPrivate) {
            features.push("Private boat", "Flexible schedule");
          }
          if (isNight) {
            features.push("Underwater lights provided", "Small groups");
          }

          // Duration fallback heuristics
          let duration: string | undefined = t.duration || undefined;
          if (!duration) {
            if (isWreck) duration = "8 hours";
            else if (isReef || isSnorkel) duration = "4 hours";
            else if (isNight) duration = "3 hours";
          }

          return {
            id: t.id,
            slug: t.slug,
            title: t.name,
            category: t.categoryDisplay || (t.categories?.[0]?.name ?? "All"),
            price: Number(t.price) || 0,
            duration,
            rating: Number(t.average_rating) || 0,
            reviews: Number(t.rating_count) || 0,
            description: desc,
            image: t.image || HOME_IMAGES.unsplashDiversWide,
            permalink: t.permalink,
            features,
            catSlugs,
            catNames,
          } as TripItem;
        });
        if (!ignore && trips.length > 0) setAdventures(trips);
      } catch (e) {
        console.warn("Trips API error; keeping current adventures", e);
      } finally {
        if (!ignore) setLoadingTrips(false);
      }
    }
    loadTrips();
    return () => {
      ignore = true;
    };
  }, [initialTrips]);

  const christAbyssImage = HOME_IMAGES_SAFE.christStatue;

  const heroSlides = [
    {
      id: 1,
      headline: "Welcome To The Florida Keys",
      subtext: "Platinum ScubaPro Dealer • 10K+ Happy Divers",
      cta: "Explore All Adventures",
      image: HOME_IMAGES.heroPrimary,
      alt: "Professional diving instructor with students underwater",
      featuredProduct: {
        title: "Ultimate Scuba Diving Experience",
        category: "Top Scuba Experience",
        price: 249,
        salePrice: 229,
        description: "Guided discovery dive experience",
        image: HOME_IMAGES.heroProduct,
        badge: "Sells Out Daily!",
        location: "Key Largo, Florida Keys",
        highlights:
          "No Prior Training Required • Pool Training �� 2 Coral Reef Dives",
        points: [
          "No Prior Training Required",
          "Pool Training",
          "2 Coral Reef Dives",
        ],
      },
      topProducts: [
        { name: "Christ Statue Tour", price: "$89", category: "Snorkeling" },
        { name: "Coral Gardens Dive", price: "$125", category: "Reef Diving" },
        {
          name: "Night Dive Adventure",
          price: "$95",
          category: "Night Diving",
        },
      ],
    },
    {
      id: 2,
      headline: "Only in Key Largo",
      subtext:
        "Crystal clear waters �������� 50+ dive sites • Year-round diving",
      cta: "Discover What&apos;s Below",
      image: HOME_IMAGES.unsplashReefWide,
      alt: "Aerial view of crystal clear Key Largo waters with coral reefs",
      featuredProduct: {
        title: "Spiegel Grove Wreck",
        category: "Exclusive Location",
        price: 145,
        description: "510ft Navy ship wreck dive",
        image: HOME_IMAGES.unsplashReefWide,
        badge: "Key Largo Exclusive",
        location: "Key Largo Marine Sanctuary",
        highlights: "Advanced dive • 100ft depth • Wreck penetration",
        points: ["Advanced dive", "100ft depth", "Wreck penetration"],
      },
      topProducts: [
        {
          name: "Spiegel Grove Wreck",
          price: "$145",
          category: "Wreck Diving",
        },
        { name: "Coral Gardens", price: "$125", category: "Reef Diving" },
        { name: "Private Charter", price: "$1200", category: "Private" },
      ],
    },
    {
      id: 3,
      headline: "From Beginner to Certified Pro",
      subtext: "PADI courses • Equipment • Guided tours",
      cta: "Start Your Journey",
      image: HOME_IMAGES.unsplashDiversWide,
      alt: "Diverse group of newly certified divers celebrating achievement",
      featuredProduct: {
        title: "Open Water Certification",
        category: "PADI Training",
        price: 499,
        description: "Complete diving certification",
        image: HOME_IMAGES.unsplashDiversWide,
        badge: "Beginner Friendly",
        location: "PADI 5-Star Dive Center",
        highlights: "3-day course • E-learning included • Lifetime cert",
        points: [
          "3-day course",
          "E-learning included",
          "Lifetime certification",
        ],
      },
      topProducts: [
        { name: "Open Water Cert", price: "$499", category: "Beginner" },
        { name: "Advanced Cert", price: "$375", category: "Advanced" },
        { name: "Rescue Diver", price: "$550", category: "Professional" },
      ],
    },
  ];

  // Show only the first slide and pause auto-advance for now
  const autoRotate = false;
  const visibleSlides = React.useMemo(
    () => heroSlides.slice(0, 1),
    [heroSlides],
  );

  React.useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length, autoRotate]);

  const defaultAdventures = [
    {
      id: 1,
      title: "Christ of the Abyss",
      category: "Snorkeling Trips",
      price: 89,
      duration: "4 hours",
      rating: 4.9,
      reviews: 487,
      description:
        "Experience the world-famous 9-foot bronze Christ statue in crystal-clear waters",
      image: HOME_IMAGES.unsplashDiversWide,
      features: [
        "All equipment included",
        "Small groups",
        "Professional guides",
      ],
    },
    {
      id: 2,
      title: "Coral Gardens Reef Dive",
      category: "Reef Dive Trips",
      price: 125,
      duration: "6 hours",
      rating: 4.8,
      reviews: 324,
      description:
        "Explore pristine coral gardens with vibrant marine life at 40-60 feet",
      image: HOME_IMAGES.unsplashReefWide,
      features: ["2 tank dive", "Certified divers only", "Underwater photos"],
    },
    {
      id: 3,
      title: "Spiegel Grove Wreck",
      category: "Wreck Dive Trips",
      price: 145,
      duration: "8 hours",
      rating: 4.9,
      reviews: 198,
      description:
        "Dive the massive 510-foot Navy ship wreck, one of the largest artificial reefs",
      image: HOME_IMAGES.unsplashDiversWide,
      features: ["Advanced dive", "2 tank dive", "Wreck penetration"],
    },
    {
      id: 4,
      title: "Night Dive Adventure",
      category: "Night Dives",
      price: 95,
      duration: "3 hours",
      rating: 4.7,
      reviews: 156,
      description:
        "Experience the underwater world after dark with unique marine life behavior",
      image: HOME_IMAGES.unsplashReefWide,
      features: ["Underwater lights", "Night creatures", "Small groups"],
    },
    {
      id: 5,
      title: "Spearfishing Expedition",
      category: "Spearfishing Trips",
      price: 175,
      duration: "6 hours",
      rating: 4.6,
      reviews: 89,
      description:
        "Target hogfish, grouper, and snapper in pristine waters with expert guides",
      image: HOME_IMAGES.unsplashDiversWide,
      features: ["Equipment included", "Cleaning service", "Licensed guides"],
    },
    {
      id: 6,
      title: "Lobster Hunting",
      category: "Lobster Trips",
      price: 155,
      duration: "5 hours",
      rating: 4.8,
      reviews: 112,
      description:
        "Hunt for spiny lobsters in season with professional guides and equipment",
      image: HOME_IMAGES.unsplashReefWide,
      features: ["Season: Aug-Mar", "Equipment provided", "Cleaning included"],
    },
    {
      id: 7,
      title: "Private Charter",
      category: "Private Charters",
      price: 1200,
      duration: "8 hours",
      rating: 5.0,
      reviews: 67,
      description:
        "Customize your perfect day with private boat, captain, and diving guide",
      image: HOME_IMAGES.unsplashDiversWide,
      features: ["Up to 12 guests", "Custom itinerary", "Gourmet lunch"],
    },
  ];

  const sortedAdventures = React.useMemo(() => {
    if (
      !activeAdventureFilter ||
      (activeAdventureFilter || "").toLowerCase() === "all"
    )
      return adventures;
    const wanted = (activeAdventureFilter || "").toLowerCase();
    return adventures.filter((a) =>
      (a.catSlugs || []).map((s) => (s || "").toLowerCase()).includes(wanted),
    );
  }, [adventures, activeAdventureFilter]);

  // Fallback: if filter no longer exists or yields no results, reset to All
  useEffect(() => {
    if (!activeAdventureFilter) return;
    const valid = adventureFilterOptions.some(
      (f) => f.name === activeAdventureFilter,
    );
    if (!valid) setActiveAdventureFilter("");
  }, [activeAdventureFilter]);

  useEffect(() => {
    if (
      adventures.length > 0 &&
      activeAdventureFilter &&
      sortedAdventures.length === 0
    ) {
      setActiveAdventureFilter("");
    }
  }, [adventures.length, activeAdventureFilter, sortedAdventures.length]);

  const adventureFilterOptions = [
    { name: "reef-dives", icon: Fish, color: "sage" },
    { name: "wreck-dives", icon: Ship, color: "ocean" },
    { name: "snorkeling-trips", icon: Waves, color: "coral" },
    { name: "private-dive-charters", icon: Anchor, color: "ocean" },
    { name: "night-dive", icon: Moon, color: "coral" },
    { name: "spearfishing", icon: Target, color: "sage" },
    { name: "private-snorkeling-trips", icon: Waves, color: "coral" },
    { name: "sunset-cruise", icon: Ship, color: "coral" },
  ];

  // Fallback static data (used only if API fails)
  const certifications = [
    {
      id: 1,
      title: "PADI Open Water",
      category: "Beginner",
      price: 499,
      duration: "3 Days",
      dives: "4 Dives",
      eLearning: true,
      description: "Your diving adventure begins here",
      image: HOME_IMAGES.unsplashDiversWide,
      color: "sage",
      features: [
        "Pool training & theory",
        "Digital learning materials",
        "Lifetime certification card",
      ],
    },
    {
      id: 2,
      title: "Advanced Open Water",
      category: "Advanced",
      price: 375,
      duration: "2 Days",
      dives: "5 Dives",
      eLearning: true,
      description: "Expand your underwater skills",
      image: HOME_IMAGES.unsplashDiversWide,
      color: "ocean",
      features: [
        "Deep diving to 100 feet",
        "Underwater navigation",
        "Specialty dive options",
      ],
    },
    {
      id: 3,
      title: "Rescue Diver",
      category: "Advanced",
      price: 550,
      duration: "3 Days",
      dives: "2 Dives",
      eLearning: true,
      description: "Become a dive leader",
      image: HOME_IMAGES.unsplashReefWide,
      color: "coral",
      features: [
        "Emergency response training",
        "Rescue scenarios",
        "First aid certification",
      ],
    },
    {
      id: 4,
      title: "Private Instruction",
      category: "EFR/CPR",
      price: 800,
      duration: "Flexible",
      dives: "4+ Dives",
      eLearning: true,
      description: "One-on-one personalized training",
      image: HOME_IMAGES.unsplashPortraitTraining,
      color: "sage",
      features: [
        "Personal instructor",
        "Flexible scheduling",
        "Customized curriculum",
      ],
    },
    {
      id: 5,
      title: "Night Diving Specialty",
      category: "Specialty",
      price: 275,
      duration: "1 Day",
      dives: "3 Dives",
      eLearning: false,
      description: "Explore the underwater world after dark",
      image: HOME_IMAGES.unsplashDiversWide,
      color: "ocean",
      features: [
        "Underwater lighting techniques",
        "Marine life behavior",
        "Safety procedures",
      ],
    },
    {
      id: 6,
      title: "Underwater Photography",
      category: "Specialty",
      price: 325,
      duration: "2 Days",
      dives: "2 Dives",
      eLearning: true,
      description: "Capture the beauty beneath the waves",
      image: HOME_IMAGES.unsplashReefWide,
      color: "coral",
      features: [
        "Camera techniques",
        "Composition skills",
        "Digital processing",
      ],
    },
  ];

  // Map UI filter to Woo category ID
  const CERT_CATEGORY_IDS: Record<string, number> = {
    Beginner: 318,
    Advanced: 319,
    "EFR/CPR": 321,
    Specialty: 320,
  };

  const [certProducts, setCertProducts] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  useEffect(() => {
    const catId = CERT_CATEGORY_IDS[activeFilter];
    if (!catId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingCerts(true);
        setCertError(null);
        const res = await fetch(`/api/products?limit=24&category=${catId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json && json.success === false) {
          setCertProducts([]);
          setCertError(json.message || "Failed to load courses");
          return;
        }
        const products = Array.isArray(json) ? json : json.products || [];
        const mapped = products.map((p: any) => {
          const clean = (p.short_description || "")
            .replace(/<[^>]+>/g, "")
            .trim();
          const nameLower = String(p.name || "").toLowerCase();

          // Heuristics for cert metadata
          let duration: string | undefined;
          let dives: string | undefined;
          let eLearning = false;
          const features: string[] = [];

          const matchDays = clean.match(/(\d+)\s*(day|days)/i);
          if (matchDays)
            duration = `${matchDays[1]} ${Number(matchDays[1]) === 1 ? "Day" : "Days"}`;
          const matchDives = clean.match(/(\d+)\s*(dive|dives)/i);
          if (matchDives)
            dives = `${matchDives[1]} ${Number(matchDives[1]) === 1 ? "Dive" : "Dives"}`;
          if (/e[-\s]?learning/i.test(clean) || /elearning/i.test(clean))
            eLearning = true;

          if (/open water/i.test(p.name)) {
            duration ||= "3 Days";
            dives ||= "4 Dives";
            eLearning = true;
            features.push("Pool training & theory", "Lifetime certification");
          } else if (/advanced open water/i.test(p.name)) {
            duration ||= "2 Days";
            dives ||= "5 Dives";
            eLearning = true;
            features.push("Deep & navigation dives", "Specialty options");
          } else if (/rescue/i.test(p.name)) {
            duration ||= "3 Days";
            dives ||= "2 Dives";
            eLearning = true;
            features.push("Emergency response", "Rescue scenarios");
          } else if (/refresher|reactivate/i.test(p.name)) {
            duration ||= "1 Day";
            dives ||= "Pool + 1-2 Dives";
            features.push("Skills review", "Instructor-led session");
          }

          if (features.length === 0 && clean) {
            const bullets = clean
              .split(/[•\n\r]/)
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 2);
            features.push(...bullets);
          }

          return {
            id: p.id,
            title: p.name,
            category: activeFilter,
            price: parseFloat(p.price || p.regular_price || "0") || 0,
            duration,
            dives,
            eLearning,
            description: clean,
            image: (p.images && p.images[0]?.src) || "/placeholder.svg",
            color: "ocean",
            features,
            slug:
              (typeof p.slug === "string" && p.slug) ||
              (p.permalink || "").split("/").filter(Boolean).pop() ||
              String(p.id),
          };
        });
        if (!cancelled) setCertProducts(mapped);
      } catch (e) {
        if (!cancelled) setCertProducts([]);
      } finally {
        if (!cancelled) setLoadingCerts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  const filteredCertifications = certProducts;

  const filterOptions = [
    { name: "Beginner", icon: Star, color: "sage" },
    { name: "Advanced", icon: Award, color: "coral" },
    { name: "EFR/CPR", icon: UserCheck, color: "ocean" },
    { name: "Specialty", icon: BookOpen, color: "sage" },
  ];

  // Gear filter options
  const gearFilterOptions = [
    // { name: "All", icon: Users, color: "ocean" },
    // { name: "Scuba Gear", icon: Star, color: "sage" },
    { name: "Regulators", icon: UserCheck, color: "ocean" },
    { name: "BCDs", icon: Award, color: "coral" },
    { name: "Scuba Masks", icon: BookOpen, color: "sage" },
    { name: "Dive Fins", icon: Fish, color: "coral" },
    { name: "Rash Guards", icon: Waves, color: "ocean" },
  ];

  // Filter featured gear products
  const filteredFeaturedGear = React.useMemo(() => {
    // Since we're now loading category-specific products, just return all products

    return featuredGearProducts;
  }, [featuredGearProducts]);

  // Gear slider navigation functions
  const nextGearSlide = () => {
    const maxSlides = Math.max(
      0,
      Math.ceil(filteredFeaturedGear.length / 6) - 1,
    );
    setCurrentGearSlide((prev) => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevGearSlide = () => {
    const maxSlides = Math.max(
      0,
      Math.ceil(filteredFeaturedGear.length / 6) - 1,
    );
    setCurrentGearSlide((prev) => (prev <= 0 ? maxSlides : prev - 1));
  };

  // Reset gear slide when filter changes
  React.useEffect(() => {
    setCurrentGearSlide(0);
  }, [activeGearFilter]);

  return (
    <div className="min-h-screen">
      {/* Demo Navigation Banner */}
      <Navigation />

      {/* Enhanced Hero Section */}
      <section className="relative w-screen overflow-visible flex items-start pt-24 md:pt-28">
        {/* Background Image */}
        <Image
          src={heroSlides[0].image}
          alt="Key Largo Scuba Diving hero"
          width={2400}
          height={1200}
          sizes="100vw"
          className="block w-screen h-auto"
          priority
          unoptimized
        />
        <div className="absolute inset-0 z-10 pointer-events-none bg-transparent" />

        {heroVariant === 2 && (
          <div className="absolute inset-0 bg-gradient-to-tr from-ocean/40 via-transparent to-coral/30 mix-blend-multiply"></div>
        )}
        {false && <></>}

        {/* Floating Bubbles for Underwater Ambiance */}

        {/* Floating Gradient Orbs */}

        {/* Additional floating elements */}

        <div className="absolute inset-x-0 top-20 bottom-0 z-20 container mx-auto px-4 py-0 flex items-center justify-center">
          <div
            className={`grid ${heroVariant === 3 ? "grid-cols-1" : "lg:grid-cols-2"} gap-12 items-center`}
          >
            {/* Left Content */}
            <div
              className={
                heroVariant === 3
                  ? "text-center mx-auto max-w-3xl"
                  : "text-left"
              }
            >
              <h1
                className={`font-bold text-white mb-6 leading-tight drop-shadow-lg ${heroVariant === 3 ? "text-6xl lg:text-7xl" : "text-6xl lg:text-7xl"}`}
              >
                Key Largo Scuba Diving
              </h1>

              {/* Hero Slider */}
              <div className="mb-8">
                <p
                  className={`${heroVariant === 3 ? "text-lg" : "text-xl"} text-white/90 mb-6 leading-relaxed drop-shadow-md`}
                >
                  Warm water, crystal clear visibility, great for all skill
                  levels, only 1 hour south of Miami International Airport.
                </p>
                <div
                  className={`flex flex-wrap ${heroVariant === 3 ? "justify-center" : "justify-start"} gap-3 mb-6`}
                >
                  <Badge className="bg-white/90 text-sage border-sage/30 backdrop-blur-sm">
                    Platinum SCUBAPRO PARTNER
                  </Badge>
                  <Badge className="bg-white/90 text-ocean border-ocean/30 backdrop-blur-sm">
                    PADI DIVE CENTER
                  </Badge>
                </div>
                <div
                  className={`flex gap-3 ${heroVariant === 3 ? "justify-center" : ""}`}
                >
                  <Link href="/trips-tours">
                    <Button
                      size="lg"
                      className={`bg-coral hover:bg-coral/90 text-white font-semibold ${heroVariant === 3 ? "text-base px-6 py-3" : "text-lg px-8 py-4"} drop-shadow-lg`}
                    >
                      Trips & Tours
                    </Button>
                  </Link>
                  <Link href="/certification">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`bg-white/90 text-gray-900 border-white hover:bg-white shadow-lg font-semibold ${heroVariant === 3 ? "text-base px-5 py-3" : "text-lg px-6 py-4"}`}
                    >
                      Scuba Training
                    </Button>
                  </Link>
                </div>
                <div
                  className={`mt-4 ${heroVariant === 3 ? "justify-center" : ""} flex items-center gap-3 text-white/90`}
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span>4.8/5 • 15000+ Happy Customers</span>
                </div>
              </div>
            </div>

            {/* Right Side - Dynamic Product Showcase */}
            {false && (
              <div className="relative">
                {/* Section 1: Featured Product */}
                <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={heroSlides[currentSlide].featuredProduct.image}
                    alt={heroSlides[currentSlide].featuredProduct.title}
                    width={1000}
                    height={1000}
                    className="w-full h-80 object-cover transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {heroSlides[currentSlide].featuredProduct.location}
                      </span>
                    </div>
                    <h3 className="text-xl text-white mb-1">
                      {heroSlides[currentSlide].featuredProduct.title
                        .split(/(Ultimate|Experience)/i)
                        .map((seg, i) =>
                          /^(ultimate|experience)$/i.test(seg) ? (
                            <span key={i} className="font-bold text-red-600">
                              {seg}
                            </span>
                          ) : (
                            <span key={i}>{seg}</span>
                          ),
                        )}
                    </h3>
                    {heroSlides[currentSlide].featuredProduct.points ? (
                      <ul className="text-white/90 text-sm mb-2 space-y-1 list-disc list-inside">
                        {heroSlides[currentSlide].featuredProduct.points.map(
                          (pt: string, i: number) => (
                            <li key={i}>{pt}</li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p className="text-white/90 text-sm mb-2">
                        {heroSlides[currentSlide].featuredProduct.highlights}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        {heroSlides[currentSlide].featuredProduct.salePrice ? (
                          <>
                            <span className="text-xl line-through text-white/70">
                              ${heroSlides[currentSlide].featuredProduct.price}
                            </span>
                            <span className="text-2xl font-bold text-white">
                              $
                              {
                                heroSlides[currentSlide].featuredProduct
                                  .salePrice
                              }
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            ${heroSlides[currentSlide].featuredProduct.price}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-coral hover:bg-coral/90 text-white"
                        onClick={openBooking}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-coral text-white">
                    {heroSlides[currentSlide].featuredProduct.badge}
                  </Badge>
                  <Badge className="absolute top-4 left-4 bg-white/20 text-white backdrop-blur-sm">
                    {heroSlides[currentSlide].featuredProduct.category}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Most Popular - Horizontal Scroll */}
      <section className="pt-4 md:pt-6 pb-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-4 w-max">
              {/* Block 1: Try Scuba Diving Experience */}
              <Link
                href="/scuba-certification-courses-florida-keys/discover-scuba-diving-key-largo"
                className="relative w-72 md:w-80 h-40 rounded-2xl overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={HOME_IMAGES.wpTryScuba}
                  alt="Try Scuba Diving Experience in the Florida Keys"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Top meta */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    Beginner
                  </span>
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    All Gear Included
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-black/60 text-white border border-white/10">
                    From $225
                  </span>
                </div>
                {/* Bottom content */}
                <div className="absolute inset-0 p-4 text-white flex flex-col justify-end z-10">
                  <h3 className="text-base font-bold leading-snug">
                    Try Scuba Diving Experience
                  </h3>
                  <p className="text-xs text-white/90">
                    Pool training + 2 Coral Reef Dives
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 8:00 AM Daily
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5" /> Swimming required
                    </span>
                  </div>
                </div>
              </Link>

              {/* Block 2: Christ Statue Tours */}
              <Link
                href="/product/key-largo-christ-statue-snorkeling-tour/"
                className="relative w-72 md:w-80 h-40 rounded-2xl overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={christAbyssImage || HOME_IMAGES.christStatue}
                  alt="Christ of the Abyss Statue Snorkeling and Diving Tours"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Top meta */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    Guaranteed Statue
                  </span>
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    Snorkel or Dive
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-black/60 text-white border border-white/10">
                    From $70
                  </span>
                </div>
                {/* Bottom content */}
                <div className="absolute inset-0 p-4 text-white flex flex-col justify-end z-10">
                  <h3 className="text-base font-bold leading-snug">
                    Christ Statue Tours
                  </h3>
                  <p className="text-xs text-white/90">
                    Daily departures to Christ of the Abyss
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 1:30 PM Daily
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" /> 4 hrs
                    </span>
                  </div>
                </div>
              </Link>

              {/* Block 3: PADI Open Water Certification */}
              <Link
                href="/scuba-certification-courses-florida-keys/open-water-scuba-certification"
                className="relative w-72 md:w-80 h-40 rounded-2xl overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={HOME_IMAGES.wpDiveInOneDay}
                  alt="PADI Open Water Certification Course in Key Largo"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Top meta */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    PADI
                  </span>
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    Small Groups
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-black/60 text-white border border-white/10">
                    From $499
                  </span>
                </div>
                {/* Bottom content */}
                <div className="absolute inset-0 p-4 text-white flex flex-col justify-end z-10">
                  <h3 className="text-base font-bold leading-snug">
                    PADI Open Water Certification
                  </h3>
                  <p className="text-xs text-white/90">
                    Earn your lifetime scuba certification
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Daily Start
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" /> 2 days
                    </span>
                  </div>
                </div>
              </Link>

              {/* Block 4: Scubapro Gear Demos and Outfitting */}
              <Link
                href="/scuba-gear"
                className="relative w-72 md:w-80 h-40 rounded-2xl overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={HOME_IMAGES.wpHydrosPro}
                  alt="Scubapro Gear Demos and Outfitting"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Top meta */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    Scubapro
                  </span>
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/15 backdrop-blur text-white/95 border border-white/20">
                    Expert Advice
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-black/60 text-white border border-white/10">
                    Free Fitting
                  </span>
                </div>
                {/* Bottom content */}
                <div className="absolute inset-0 p-4 text-white flex flex-col justify-end z-10">
                  <h3 className="text-base font-bold leading-snug">
                    Scubapro Gear Demos & Outfitting
                  </h3>
                  <p className="text-xs text-white/90">
                    Get fitted and accessorize the safest way possible
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> By Appointment
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" /> 30–60 min
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Dive Trips section (inspired by reference) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-ocean"></span>
                <span className="text-ocean/90 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Florida Keys • Key Largo
                </span>
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold leading-[1.1] text-gray-900">
                Best{" "}
                <span className="bg-gradient-to-r from-ocean to-coral bg-clip-text text-transparent">
                  Scuba Diving & Snorkeling
                </span>{" "}
                in the Florida Keys
              </h2>
              <p className="mt-4 text-base md:text-lg text-gray-600">
                Key Largo Scuba Diving is a full service dive shop in the
                Florida Keys. We operate 365 days per year from 7:00AM - 11:00PM
                EST. As a Platinum SCUBAPRO Partner and PADI Dive Center we are
                uniquely positioned to provide world class diver training and
                certification every day.
                <br />
                <br />
                We offer Certified Divers and Snorkelers access to the largest
                network of Destination based tours in South Florida and
                beyond...
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                  <Store className="w-4 h-4 text-sage" /> Platinum ScubaPro
                  Dealer
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                  <Waves className="w-4 h-4 text-ocean" /> Ocean Reef Full Face
                  Mask Communications
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                  <Award className="w-4 h-4 text-coral" /> PADI Dive IDC Staff
                  Instructors
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                  <Users className="w-4 h-4 text-gray-700" /> Private Charter
                  and Group Trip Experts
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/trips-tours">
                  <Button className="bg-ocean hover:bg-ocean/90 text-white">
                    Explore Trips
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-gray-300">
                    Plan My Day
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center justify-center">
                  <div className="inline-block w-[298px] overflow-hidden rounded-xl border border-gray-200">
                    <AspectRatio ratio={298 / 615}>
                      <Image
                        src={promoImg1}
                        alt="Guests learning to scuba dive in Key Largo"
                        fill
                        sizes="(min-width: 1024px) 298px, (min-width: 768px) 45vw, 90vw"
                        className="object-cover"
                        unoptimized
                      />
                    </AspectRatio>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="inline-block w-[273px] overflow-hidden rounded-xl border border-gray-200">
                    <AspectRatio ratio={273 / 473}>
                      <Image
                        src={promoImg2}
                        alt="Snorkelers exploring coral reefs in the Florida Keys"
                        fill
                        sizes="(min-width: 1024px) 273px, (min-width: 768px) 45vw, 90vw"
                        className="object-cover"
                        unoptimized
                      />
                    </AspectRatio>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KLSD Value Proposition */}
      {valuePropVariant === 1 ? (
        /* Version 1 retained */
        <section className="py-14 md:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Key Largo Scuba Diving, Made Easy
                </h2>
                <p className="mt-2 text-gray-700">
                  Plan, outfit, and run unforgettable days on the water—tailored
                  to you.
                </p>
                <div className="relative mt-4 aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <Image
                    src={HOME_IMAGES.wpHowToScuba}
                    alt="Diving the reefs of Key Largo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-white/15 text-white border border-white/20 backdrop-blur">
                      Guaranteed Statue
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-white/15 text-white border border-white/20 backdrop-blur">
                      Private Boats
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-white/15 text-white border border-white/20 backdrop-blur">
                      PADI Training
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Star
                          className="w-4 h-4 text-amber-400"
                          fill="currentColor"
                        />{" "}
                        4.9/5
                      </span>
                      <span className="opacity-90">10K+ Happy Divers</span>
                      <span className="opacity-90">25+ Boats</span>
                    </div>
                    <Link
                      href="/trips-tours"
                      className="hidden sm:inline-flex items-center gap-1 rounded-md bg-white/90 text-gray-900 px-3 py-1.5 text-xs font-medium shadow hover:bg-white"
                    >
                      Explore Trips
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-ocean mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Every Site, Every Day
                    </div>
                    <p className="text-sm text-gray-600">
                      Christ of the Abyss, Molasses, Grecian Rocks, reefs,
                      wrecks, night dives—matched to your skill and conditions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-coral mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      PADI Training, Start to Pro
                    </div>
                    <p className="text-sm text-gray-600">
                      Try Scuba, Open Water, Advanced, and Rescue with flexible
                      scheduling and pool sessions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Safety and Honest Weather Calls
                    </div>
                    <p className="text-sm text-gray-600">
                      Clear expectations and conservative decisions so your
                      family has an amazing day.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-ocean mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Real Humans, 7am–11pm
                    </div>
                    <p className="text-sm text-gray-600">
                      Plan by text or call, last‑minute changes welcomed—we’ll
                      match you to the right trip.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-sage mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Platinum ScubaPro Dealer
                    </div>
                    <p className="text-sm text-gray-600">
                      Pro fitting, demos, and same‑day outfitting so you’re
                      comfortable and confident.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : valuePropVariant === 2 ? (
        /* Version 2 retained */
        <section className="py-16 relative overflow-hidden bg-gradient-to-br from-ocean/5 via-white to-coral/5">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-extrabold text-ocean">
                      10K+
                    </div>
                    <div className="text-xs text-gray-600">Happy Divers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-coral">
                      25+
                    </div>
                    <div className="text-xs text-gray-600">
                      Boats & Captains
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-sage">365</div>
                    <div className="text-xs text-gray-600">Days · 7am–11pm</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-ocean/10 text-ocean border border-ocean/20">
                    Guaranteed Statue
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-coral/10 text-coral border border-coral/20">
                    Weather‑Honest
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-sage/10 text-sage border border-sage/20">
                    Flexible Rebooking
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-500">
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                  </div>
                  <p className="mt-3 text-gray-700 text-sm">
                    “Had an amazing experience getting my open water
                    certification. Patient instructors, honest weather calls,
                    and the Christ Statue was the highlight of our trip.”
                  </p>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  — Verified Google Review
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">
                  Plan Your Perfect Day
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tell us your group, dates, and goals—we’ll match you to the
                  right boats, sites, and training.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href="tel:(305) 391-4040"
                    className="inline-flex items-center justify-center rounded-md bg-ocean text-white px-3 py-2 text-sm font-medium hover:opacity-95"
                  >
                    <span className="mr-2">Call</span> (305) 391-4040
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Text / Message
                  </Link>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
                  <li>Christ Statue guaranteed daily</li>
                  <li>Private training and custom itineraries</li>
                  <li>Same‑day outfitting at our ScubaPro shop</li>
                </ul>
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
          ></div>
        </section>
      ) : valuePropVariant === 3 ? (
        /* Version 3: Mosaic visual section */
        <section className="hidden">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-12 gap-6 items-stretch">
              {/* Mosaic left */}
              <div className="md:col-span-7 grid gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <Link
                    href="/product/key-largo-christ-statue-snorkeling-tour/"
                    className="relative rounded-2xl overflow-hidden h-36 border border-gray-200 group"
                  >
                    <Image
                      src={HOME_IMAGES.unsplashDiversWide}
                      alt="Christ of the Abyss"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">
                      Guaranteed Christ Statue
                    </div>
                  </Link>
                  <Link
                    href="/certification"
                    className="relative rounded-2xl overflow-hidden h-36 border border-gray-200 group"
                  >
                    <Image
                      src={HOME_IMAGES.wpDiveInOneDay}
                      alt="PADI training"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">
                      PADI Training • Daily Start
                    </div>
                  </Link>
                </div>
              </div>

              {/* Right compact card */}
              <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
                <div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-ocean">
                        10K+
                      </div>
                      <div className="text-xs text-gray-600">Happy Divers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-coral">
                        25+
                      </div>
                      <div className="text-xs text-gray-600">Boats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-sage">
                        4.9��
                      </div>
                      <div className="text-xs text-gray-600">Avg Rating</div>
                    </div>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <li className="inline-flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-ocean" /> Reefs & Wrecks
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600" />{" "}
                      Safety�����First
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-coral" /> 7am–11pm Help
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <Store className="w-4 h-4 text-sage" /> ScubaPro
                      Outfitting
                    </li>
                  </ul>
                </div>
                <div className="mt-5 flex gap-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md bg-ocean text-white px-4 py-2 text-sm font-semibold hover:opacity-95"
                  >
                    Plan My Day
                  </Link>
                  <Link
                    href="tel:(305) 391-4040"
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    <Phone className="w-4 h-4 mr-1" /> Call
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Version 4: Two-column text + staggered portraits */
        <section className="py-8 md:py-10 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="text-ocean text-xs font-semibold uppercase tracking-wider">
                  Dive the Florida Keys
                </div>
                <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-gray-900">
                  Plan Your Perfect Day on the Water
                </h2>
                <p className="mt-2 text-gray-700">
                  Honest weather calls, expert PADI pros, and flexible
                  options—so every trip feels easy.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1">
                    <Star
                      className="w-4 h-4 text-amber-500"
                      fill="currentColor"
                    />{" "}
                    4.9/5 • 1,200+ reviews
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1">
                    <Store className="w-4 h-4 text-sage" /> ScubaPro Platinum
                    Dealer
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1">
                    <Anchor className="w-4 h-4 text-ocean" /> Reefs • Wrecks •
                    Night
                  </span>
                </div>
              </div>
              <div className="shrink-0 w-full md:max-w-sm">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="flex items-center gap-1 text-amber-500"
                      aria-label="5 star rating"
                    >
                      <Star className="w-4 h-4" fill="currentColor" />
                      <Star className="w-4 h-4" fill="currentColor" />
                      <Star className="w-4 h-4" fill="currentColor" />
                      <Star className="w-4 h-4" fill="currentColor" />
                      <Star className="w-4 h-4" fill="currentColor" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="Previous review"
                        className="inline-flex items-center justify-center rounded-full border border-gray-300 w-8 h-8 text-gray-700 hover:bg-gray-50"
                        onClick={() =>
                          setCompactReviewIndex(
                            (i) =>
                              (i - 1 + googleReviews.length) %
                              googleReviews.length,
                          )
                        }
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Next review"
                        className="inline-flex items-center justify-center rounded-full bg-coral text-white w-8 h-8 hover:bg-coral/90"
                        onClick={() =>
                          setCompactReviewIndex(
                            (i) => (i + 1) % googleReviews.length,
                          )
                        }
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 text-coral">
                      <Quote className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {googleReviews[compactReviewIndex]?.text}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        — {googleReviews[compactReviewIndex]?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Snorkeling Tours Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-ocean/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-coral/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-coral/10 text-coral border-coral/20">
              Adventures & Tours
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Best Key Largo Dive Trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the magic beneath the surface with our world-famous
              diving and snorkeling experiences in the crystal-clear waters of
              Key Largo.
            </p>
          </div>

          {/* Adventure Filter Buttons */}
          <div className="mb-12">
            <div className="overflow-x-auto pb-2 mb-8">
              <div className="flex justify-center gap-3 min-w-max">
                {adventureFilterOptions.map((filter) => {
                  const IconComponent = filter.icon;
                  const isActive = activeAdventureFilter === filter.name;
                  const colorClasses = {
                    ocean: isActive
                      ? "bg-ocean text-white border-ocean"
                      : "border-ocean text-ocean hover:bg-ocean hover:text-white",
                    sage: isActive
                      ? "bg-sage text-white border-sage"
                      : "border-sage text-sage hover:bg-sage hover:text-white",
                    coral: isActive
                      ? "bg-coral text-white border-coral"
                      : "border-coral text-coral hover:bg-coral hover:text-white",
                  };

                  return (
                    <Button
                      key={filter.name}
                      variant="outline"
                      className={`${colorClasses[filter.color]} text-sm`}
                      onClick={() => setActiveAdventureFilter(filter.name)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      <span className="capitalize">
                        {filter.name.replace(/-/g, " ")}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Adventure Cards */}
          {/* Mobile: horizontal scroll */}
          <div className="md:hidden overflow-x-auto pb-4">
            <div className="flex gap-6 w-max">
              {sortedAdventures.map((adventure) => (
                <EnhancedCard
                  key={adventure.id}
                  className="w-80 flex-shrink-0"
                  hoverScale={1}
                  glowColor="blue"
                  tilting={false}
                >
                  <Link
                    href={(() => {
                      const slugs = (adventure.catSlugs || []).map((s) =>
                        (s || "").toLowerCase(),
                      );
                      const names = (adventure.catNames || []).map((n) =>
                        (n || "").toLowerCase(),
                      );
                      let rawSlug =
                        adventure.slug ||
                        (adventure.permalink || "")
                          .split("/")
                          .filter(Boolean)
                          .pop() ||
                        String(adventure.id);
                      const titleLc = (adventure.title || "").toLowerCase();
                      if (
                        titleLc.includes("christ") &&
                        titleLc.includes("statue") &&
                        !/key-largo-christ-statue-snorkeling-tour/.test(rawSlug)
                      ) {
                        rawSlug = "key-largo-christ-statue-snorkeling-tour";
                      }
                      return `/product/${rawSlug}`;
                    })()}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={adventure.image}
                        alt={adventure.title}
                        width={1000}
                        height={1000}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>
                      <div className="absolute inset-0 p-4 text-white flex flex-col justify-end">
                        <Badge className="bg-white/20 text-white mb-2 w-fit text-xs">
                          {adventure.category}
                        </Badge>
                        <h3 className="text-lg font-bold text-white">
                          {adventure.title}
                        </h3>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/50 rounded-lg px-3 py-1">
                        <span className="text-white font-semibold">
                          ${adventure.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(adventure.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-sm">
                        {adventure.rating}
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({adventure.reviews} reviews)
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {adventure.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-ocean" />
                        <span>{adventure.duration || ""}</span>
                      </div>
                      {(adventure.features || [])
                        .slice(0, 2)
                        .map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <span className="text-green-600">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                    </div>
                    {(() => {
                      let rawSlug =
                        adventure.slug ||
                        (adventure.permalink || "")
                          .split("/")
                          .filter(Boolean)
                          .pop() ||
                        String(adventure.id);
                      const titleLc = (adventure.title || "").toLowerCase();
                      if (
                        titleLc.includes("christ") &&
                        titleLc.includes("statue") &&
                        !/key-largo-christ-statue-snorkeling-tour/.test(rawSlug)
                      ) {
                        rawSlug = "key-largo-christ-statue-snorkeling-tour";
                      }
                      return (
                        <Link
                          href={`/product/${rawSlug}`}
                          className="block w-full"
                        >
                          <Button className="w-full bg-coral hover:bg-coral/90 text-white font-semibold text-sm">
                            Book Adventure
                          </Button>
                        </Link>
                      );
                    })()}
                  </div>
                </EnhancedCard>
              ))}
            </div>
          </div>

          {/* Desktop: 4 across x 2 rows grid (no scroll) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedAdventures.slice(0, 8).map((adventure) => (
              <EnhancedCard
                key={adventure.id}
                className="w-full"
                hoverScale={1}
                glowColor="blue"
                tilting={false}
              >
                <Link
                  href={(() => {
                    let rawSlug =
                      adventure.slug ||
                      (adventure.permalink || "")
                        .split("/")
                        .filter(Boolean)
                        .pop() ||
                      String(adventure.id);
                    const titleLc = (adventure.title || "").toLowerCase();
                    if (
                      titleLc.includes("christ") &&
                      titleLc.includes("statue") &&
                      !/key-largo-christ-statue-snorkeling-tour/.test(rawSlug)
                    ) {
                      rawSlug = "key-largo-christ-statue-snorkeling-tour";
                    }
                    return `/product/${rawSlug}`;
                  })()}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={adventure.image}
                      alt={adventure.title}
                      width={1000}
                      height={1000}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 p-4 text-white flex flex-col justify-end">
                      <Badge className="bg-white/20 text-white mb-2 w-fit text-xs">
                        {adventure.category}
                      </Badge>
                      <h3 className="text-lg font-bold text-white">
                        {adventure.title}
                      </h3>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 rounded-lg px-3 py-1">
                      <span className="text-white font-semibold">
                        ${adventure.price}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(adventure.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-sm">
                      {adventure.rating}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({adventure.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {adventure.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-ocean" />
                      <span>{adventure.duration || ""}</span>
                    </div>
                    {(adventure.features || [])
                      .slice(0, 2)
                      .map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="text-green-600">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                  </div>
                  {(() => {
                    let rawSlug =
                      adventure.slug ||
                      (adventure.permalink || "")
                        .split("/")
                        .filter(Boolean)
                        .pop() ||
                      String(adventure.id);
                    const titleLc = (adventure.title || "").toLowerCase();
                    if (
                      titleLc.includes("christ") &&
                      titleLc.includes("statue") &&
                      !/key-largo-christ-statue-snorkeling-tour/.test(rawSlug)
                    ) {
                      rawSlug = "key-largo-christ-statue-snorkeling-tour";
                    }
                    return (
                      <Link
                        href={`/product/${rawSlug}`}
                        className="block w-full"
                      >
                        <Button className="w-full bg-coral hover:bg-coral/90 text-white font-semibold text-sm">
                          Book Adventure
                        </Button>
                      </Link>
                    );
                  })()}
                </div>
              </EnhancedCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-ocean hover:bg-ocean/90 text-white font-semibold px-8 py-3"
              onClick={openBooking}
            >
              View All Adventures
            </Button>
          </div>
        </div>
      </section>

      {/* PADI Certifications Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-ocean/5"></div>
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-sage/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-ocean/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-ocean/10 text-ocean border-ocean/20">
              PADI Certifications
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Learn to Dive in the{" "}
              <span className="text-ocean">Florida Keys</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your underwater journey with world-class PADI instruction
              from beginner to professional levels.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {filterOptions.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = activeFilter === filter.name;
                const colorClasses = {
                  ocean: isActive
                    ? "bg-ocean text-white border-ocean"
                    : "border-ocean text-ocean hover:bg-ocean hover:text-white",
                  sage: isActive
                    ? "bg-sage text-white border-sage"
                    : "border-sage text-sage hover:bg-sage hover:text-white",
                  coral: isActive
                    ? "bg-coral text-white border-coral"
                    : "border-coral text-coral hover:bg-coral hover:text-white",
                };

                return (
                  <Button
                    key={filter.name}
                    variant="outline"
                    className={colorClasses[filter.color]}
                    onClick={() => setActiveFilter(filter.name)}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {filter.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Cards Container - Single Row Scroll */}
          <div className="overflow-x-auto pb-4">
            {loadingCerts ? (
              <div className="flex justify-center items-center py-8 text-gray-600">
                Loading courses…
              </div>
            ) : certError ? (
              <div className="flex justify-center items-center py-8 text-red-600">
                {certError}
              </div>
            ) : filteredCertifications.length === 0 ? (
              <div className="flex justify-center items-center py-8 text-gray-600">
                No courses found.
              </div>
            ) : (
              <div className="flex gap-6 w-max snap-x snap-mandatory">
                {filteredCertifications.map((cert) => {
                  return (
                    <Card
                      key={cert.id}
                      className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm w-72 md:w-80 flex-shrink-0 snap-start group hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      {/* Image section */}
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={cert.image}
                          alt={`${cert.title} Training`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 p-4 text-white flex flex-col justify-between">
                          {/* Top info tags */}
                          <div className="flex gap-2">
                            {cert.duration ? (
                              <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-blue-500 text-white">
                                <Clock className="w-3 h-3" />
                                {cert.duration}
                              </div>
                            ) : null}
                            {cert.dives ? (
                              <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-blue-500 text-white">
                                <Users className="w-3 h-3" />
                                {cert.dives}
                              </div>
                            ) : null}
                          </div>

                          {/* Bottom content */}
                          <div>
                            <Badge className="bg-white/20 text-white mb-1 w-fit text-xs">
                              {cert.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Content section with colored accent */}
                      <div className="p-4 bg-gradient-to-b from-white to-gray-50/30">
                        {/* Title moved below image and above separator */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {cert.title}
                        </h3>
                        {/* Top border accent */}
                        <div className="h-1 w-full mb-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>

                        {/* Price and E-Learning Badge */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-2xl font-bold text-gray-900">
                            ${cert.price}
                          </div>
                          {cert.eLearning && (
                            <div className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 bg-blue-100 text-blue-700">
                              <BookOpen className="w-3 h-3" />
                              E-Learning
                            </div>
                          )}
                        </div>

                        {/* Key features with colored checkmarks */}
                        <div className="space-y-2 mb-4">
                          {cert.features.slice(0, 2).map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-ocean" />
                              <span className="text-gray-700 text-sm">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Link
                          href={`/product/${cert.slug}`}
                          className="block w-full"
                        >
                          <Button className="w-full text-white font-semibold text-sm py-2 relative overflow-hidden group bg-blue-600 hover:bg-blue-700">
                            <div className="absolute inset-0 bg-white/10 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            <span className="relative z-10">
                              {cert.category === "EFR/CPR"
                                ? "Book Session"
                                : cert.category === "Specialty"
                                  ? "Learn More"
                                  : cert.category === "Beginner"
                                    ? "Start Now"
                                    : "Book Course"}
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-ocean hover:bg-ocean/90 text-white font-semibold px-8 py-3"
              onClick={openBooking}
            >
              View All Certifications
            </Button>
          </div>
        </div>
      </section>

      {/* Google Reviews (Auto-scrolling) */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge className="bg-ocean/10 text-ocean border-ocean/20">
                Loved by Divers
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3">
                Great PADI Instructors. Professional Customer Service.
              </h2>
              <p className="text-gray-600 mt-2">
                Real Google reviews from guests who trained and dove with us in
                Key Largo.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                ref={reviewsRef}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-2"
              >
                {googleReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="min-w-[320px] max-w-[380px] shrink-0 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm snap-start"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900">
                        {review.name}
                      </div>
                      <div className="flex">
                        <Star className="w-4 h-4 text-coral fill-coral" />
                        <Star className="w-4 h-4 text-coral fill-coral" />
                        <Star className="w-4 h-4 text-coral fill-coral" />
                        <Star className="w-4 h-4 text-coral fill-coral" />
                        <Star className="w-4 h-4 text-coral fill-coral" />
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {review.text}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500">
                      <span className="inline-block rounded-full bg-red-500 text-white px-2 py-0.5">
                        Google
                      </span>
                      <span>Verified Review</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => scrollReviews("left")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button
                className="bg-coral hover:bg-coral/90 text-white"
                onClick={() => scrollReviews("right")}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Gradient Fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white" />
          </div>
        </div>
      </section>

      {/* Dive Shop Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-sage/5 to-gray-50/50"></div>

        {/* Subtle Equipment Icons Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 1000 600" fill="none">
            <g className="text-sage">
              <rect
                x="100"
                y="100"
                width="20"
                height="40"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <rect
                x="700"
                y="200"
                width="25"
                height="35"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <rect
                x="300"
                y="350"
                width="18"
                height="45"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <rect
                x="850"
                y="450"
                width="22"
                height="38"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </g>
            <g className="text-ocean">
              <circle
                cx="200"
                cy="250"
                r="15"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="600"
                cy="150"
                r="18"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="450"
                cy="450"
                r="12"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="800"
                cy="350"
                r="16"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </g>
          </svg>
        </div>

        {/* Hexagonal Pattern */}
        <div className="absolute inset-0 opacity-[0.008]">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern
                id="hexagons"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="10,2 18,7 18,13 10,18 2,13 2,7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-coral"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="absolute top-1/3 right-0 w-96 h-96 bg-ocean/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-coral/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-sage/10 text-sage border-sage/20">
              Professional Dive Shop
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Platinum Dealer & Full Service{" "}
              <span className="text-sage">Dive Shop</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Brick & mortar store with shipping warehouse. Platinum dealer
              status for premium brands and professional equipment service.
            </p>
          </div>

          {/* Featured Scuba Gear Products */}
          <div className="mb-16">
            {/* Gear Filter Buttons */}
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {gearFilterOptions.map((filter) => {
                  const IconComponent = filter.icon;
                  const isActive = activeGearFilter === filter.name;
                  const colorClasses = {
                    ocean: isActive
                      ? "bg-ocean text-white border-ocean"
                      : "border-ocean text-ocean hover:bg-ocean hover:text-white",
                    sage: isActive
                      ? "bg-sage text-white border-sage"
                      : "border-sage text-sage hover:bg-sage hover:text-white",
                    coral: isActive
                      ? "bg-coral text-white border-coral"
                      : "border-coral text-coral hover:bg-coral hover:text-white",
                  };

                  return (
                    <Button
                      key={filter.name}
                      variant="outline"
                      className={colorClasses[filter.color]}
                      onClick={() => setActiveGearFilter(filter.name)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {filter.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Product Cards Slider */}
            <div className="relative">
              {loadingFeaturedGear ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-ocean" />
                  <span className="ml-2 text-gray-600">
                    Loading featured gear...
                  </span>
                </div>
              ) : (
                <div>
                  {/* Product Cards Container */}
                  <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 md:gap-8 w-max">
                      {filteredFeaturedGear.length > 0 ? (
                        filteredFeaturedGear.map((product, index) => (
                          <Link
                            key={`${product.id}-${product.categoryId}-${index}`}
                            href={`/product/${product.slug || slugify(product.name)}?categoryId=${product.categoryId || 186}&productId=${product.id}`}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow w-48 flex-shrink-0 cursor-pointer"
                          >
                            <div className="relative h-32 mb-3 bg-gray-50 rounded-lg overflow-hidden">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={300}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <span className="text-gray-400 text-xs">
                                    No Image
                                  </span>
                                </div>
                              )}
                              {product.badges && product.badges.length > 0 && (
                                <Badge className="absolute top-2 right-2 bg-blue-600 text-white text-xs">
                                  {product.badges[0]}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                              {product.category}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-ocean">
                                {product.price}
                              </div>
                              {product.originalPrice && (
                                <div className="text-sm text-gray-500 line-through">
                                  {product.originalPrice}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-6 text-center py-12">
                          <p className="text-gray-500">
                            No featured gear products available at the moment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dealer Status Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Platinum ScubaPro Dealer
                </span>
              </div>
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-teal-900">
                  Platinum Ocean Reef Dealer
                </span>
              </div>
            </div>
          </div>

          {/* Shop Services */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-ocean/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-ocean" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Brick & Mortar Store
              </h3>
              <p className="text-gray-600 mb-4">
                Full retail dive shop with complete equipment selection, fitting
                rooms, and expert staff
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>��� Complete gear selection</li>
                <li>• Professional fitting</li>
                <li>• Expert recommendations</li>
                <li>• Try before you buy</li>
              </ul>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-coral/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Equipment Service
              </h3>
              <p className="text-gray-600 mb-4">
                Factory-certified technicians providing professional equipment
                service and repairs
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Regulator service</li>
                <li>• BCD repairs</li>
                <li>• Tank inspections</li>
                <li>• Warranty work</li>
              </ul>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-sage/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-sage" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Shipping Warehouse
              </h3>
              <p className="text-gray-600 mb-4">
                Full shipping capabilities with fast delivery anywhere in the
                United States
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Nationwide shipping</li>
                <li>• Same-day processing</li>
                <li>• Secure packaging</li>
                <li>• Order tracking</li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative mt-16 overflow-hidden rounded-2xl">
            <Image
              src={proShopBackground}
              alt="Inside the Key Largo dive shop"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 960px, (min-width: 768px) 80vw, 100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/40" />
            <div className="relative z-10 text-center px-6 py-12 sm:px-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Visit Our Pro Shop
              </h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Stop by our retail location or browse our online store. Our
                expert staff can help you find the perfect equipment for your
                diving adventures.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-3"
                >
                  <Store className="w-5 h-5 mr-2" />
                  Visit Store
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/70 text-white hover:bg-white/10 font-semibold px-8 py-3"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Shop Online
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Private Charters Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-sage/10"></div>

        {/* Luxury Yacht Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <svg className="w-full h-full" viewBox="0 0 1000 600" fill="none">
            <path
              d="M100,300 Q200,280 300,300 Q400,320 500,300"
              stroke="currentColor"
              strokeWidth="1"
              className="text-sage"
              fill="none"
            />
            <path
              d="M600,200 Q700,180 800,200 Q900,220 1000,200"
              stroke="currentColor"
              strokeWidth="1"
              className="text-coral"
              fill="none"
            />
            <path
              d="M50,450 Q150,430 250,450 Q350,470 450,450"
              stroke="currentColor"
              strokeWidth="1"
              className="text-ocean"
              fill="none"
            />
            <circle
              cx="150"
              cy="200"
              r="3"
              fill="currentColor"
              className="text-sage"
            />
            <circle
              cx="750"
              cy="350"
              r="3"
              fill="currentColor"
              className="text-coral"
            />
            <circle
              cx="350"
              cy="500"
              r="3"
              fill="currentColor"
              className="text-ocean"
            />
          </svg>
        </div>

        {/* Diamond Pattern */}
        <div className="absolute inset-0 opacity-[0.01]">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern
                id="diamonds"
                width="15"
                height="15"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="7.5,2 12,7.5 7.5,13 3,7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  className="text-sage"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        </div>

        <div className="absolute top-0 left-1/3 w-64 h-64 bg-coral/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-sage/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-sage/10 text-sage border-sage/20">
              Luxury Charters
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Private Charter Experiences
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create unforgettable memories with our exclusive private charter
              experiences tailored to your group.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Family Charter */}
            <Card className="overflow-hidden border border-gray-200 shadow-lg">
              <div className="bg-sage p-8 text-white">
                <Badge className="bg-white/20 text-white mb-4">Family</Badge>
                <h3 className="text-3xl font-bold mb-4">
                  Family Adventure Charter
                </h3>
                <p className="text-white/90 text-lg mb-6">
                  Perfect for families and groups up to 12
                </p>
                <div className="text-4xl font-bold">$1,200</div>
                <div className="text-white/80">for 6 hours</div>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-sage text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Private yacht with captain & crew
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-sage text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Snorkeling equipment for all ages
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-sage text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Gourmet lunch & refreshments
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-sage text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Professional photography
                    </span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-sage hover:bg-sage/90 text-white font-semibold py-3 text-lg"
                  onClick={openBooking}
                >
                  Book Family Charter
                </Button>
              </div>
            </Card>

            {/* Luxury Charter */}
            <Card className="overflow-hidden border border-gray-200 shadow-lg">
              <div className="bg-coral p-8 text-white">
                <Badge className="bg-white/20 text-white mb-4">VIP</Badge>
                <h3 className="text-3xl font-bold mb-4">VIP Luxury Charter</h3>
                <p className="text-white/90 text-lg mb-6">
                  Ultimate luxury for up to 8 guests
                </p>
                <div className="text-4xl font-bold">$2,500</div>
                <div className="text-white/80">for 8 hours</div>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-coral text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Luxury yacht with premium amenities
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-coral text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Personal dive master & concierge
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-coral text-lg mt-1">✓</span>
                    <span className="text-gray-700">
                      Champagne service & gourmet dining
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-coral text-lg mt-1">��</span>
                    <span className="text-gray-700">
                      Exclusive dive sites & activities
                    </span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-coral hover:bg-coral/90 text-white font-semibold py-3 text-lg"
                  onClick={openBooking}
                >
                  Book VIP Charter
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0 border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white/90 rounded-full w-8 h-8 p-0"
              onClick={closeBooking}
            >
              <X className="w-4 h-4" />
            </Button>
            <Booking />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
