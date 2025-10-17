import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CertificationDetailsModal from "@/components/CertificationDetailsModal";
import { Clock, MapPin, Star, Users, CheckCircle, ArrowDown, Award } from "lucide-react";

interface CertificationData {
  id: string;
  name: string;
  level: string;
  duration: string;
  maxStudents: string;
  location: string;
  price: number;
  prerequisites: string;
  certification: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  images: string[];
  description: string;
}

// Mock certification data - this would come from your CMS or API
const mockCertifications: { [key: string]: CertificationData } = {
  "open-water": {
    id: "open-water",
    name: "PADI Open Water Diver Certification",
    level: "Beginner",
    duration: "3-4 Days",
    maxStudents: "6 Max",
    location: "Key Largo",
    price: 399,
    prerequisites: "Swimming ability required",
    certification: "PADI Open Water Diver",
    rating: 4.9,
    reviewCount: 324,
    highlights: [
      "Learn fundamental scuba diving skills and safety",
      "Dive to depths of 60 feet with a certified buddy",
      "Internationally recognized PADI certification",
      "All equipment and materials included",
      "Small class sizes with expert PADI instructors",
    ],
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=600&fit=crop",
    ],
    description:
      "Start your underwater adventure with the world's most popular scuba course",
  },
  "advanced-open-water": {
    id: "advanced-open-water",
    name: "PADI Advanced Open Water Diver",
    level: "Intermediate",
    duration: "2-3 Days",
    maxStudents: "6 Max",
    location: "Key Largo",
    price: 449,
    prerequisites: "Open Water Diver certification",
    certification: "PADI Advanced Open Water Diver",
    rating: 4.8,
    reviewCount: 198,
    highlights: [
      "Explore deeper dive sites up to 100 feet",
      "Master 5 specialty adventure dives",
      "Night diving and deep diving specialties",
      "Underwater navigation skills",
      "Build confidence with advanced techniques",
    ],
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
    ],
    description:
      "Take your diving skills to the next level with advanced techniques",
  },
  "rescue-diver": {
    id: "rescue-diver",
    name: "PADI Rescue Diver Certification",
    level: "Advanced",
    duration: "3-4 Days",
    maxStudents: "4 Max",
    location: "Key Largo",
    price: 549,
    prerequisites: "Advanced Open Water + EFR certification",
    certification: "PADI Rescue Diver",
    rating: 4.9,
    reviewCount: 156,
    highlights: [
      "Learn to prevent and manage diving emergencies",
      "Develop leadership and problem-solving skills",
      "Emergency response and rescue techniques",
      "Build confidence as a responsible diver",
      "Gateway to PADI professional courses",
    ],
    images: [
      "https://images.unsplash.com/photo-1566024287286-457247b70310?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=600&fit=crop",
    ],
    description:
      "Become a skilled and confident rescue diver with emergency response training",
  },
};

export default function CertificationHero({
  heroImageUrl,
  heroData,
  productId,
  initialPrice,
  productName,
  productSlug,
}: {
  heroImageUrl?: string;
  heroData?: any;
  productId?: number;
  initialPrice?: number;
  productName?: string;
  productSlug?: string;
}) {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [currentCourse, setCourse] = useState<CertificationData>({
    ...mockCertifications["open-water"],
    name:
      typeof productName === "string" && productName.trim().length > 0
        ? productName
        : mockCertifications["open-water"].name,
    price:
      typeof initialPrice === "number" && Number.isFinite(initialPrice)
        ? initialPrice
        : mockCertifications["open-water"].price,
  });
  const isDiscoverScuba =
    productSlug === "discover-scuba-diving-try-scuba";
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  // Optional: allow explicit course override via ?course=, but never default to Open Water
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const courseParam = urlParams.get("course");
      if (courseParam && mockCertifications[courseParam]) {
        setCourse((prev) => ({
          ...mockCertifications[courseParam],
          price: prev.price,
        }));
      }
    }
  }, []);

  // Load live price when productId available
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof productId !== "number") return;
      try {
        const res = await fetch(`/api/product-data/${productId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const rawPrice: unknown =
          json?.product?.price ?? json?.product?.tourData?.pricing?.basePrice;
        const numeric =
          typeof rawPrice === "number"
            ? rawPrice
            : Number.parseFloat(String(rawPrice));
        if (!cancelled && Number.isFinite(numeric)) {
          setCourse((prev) => ({ ...prev, price: numeric }));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    setCourse((prev) => {
      const next = { ...prev };
      if (
        productName &&
        productName.trim().length > 0 &&
        !isDiscoverScuba
      ) {
        next.name = productName;
      }
      if (
        typeof initialPrice === "number" &&
        Number.isFinite(initialPrice)
      ) {
        next.price = initialPrice;
      }
      return next;
    });
  }, [productName, initialPrice, isDiscoverScuba]);

  // Apply Supabase hero overrides when available
  useEffect(() => {
    if (!heroData && !isDiscoverScuba) return;
    setCourse((prev) => {
      let updated = { ...prev };
      let heroPrice: number | undefined;

      if (heroData) {
        const details = heroData?.details ?? {};
        const images = heroData?.images ?? {};
        const gallery = Array.isArray(images?.gallery)
          ? images.gallery.filter(
              (img: unknown): img is string =>
                typeof img === "string" && img.trim().length > 0,
            )
          : [];
        const heroImage =
          typeof images?.hero === "string" && images.hero.trim().length > 0
            ? images.hero
            : prev.images?.[0];
        const mergedImages = heroImage ? [heroImage, ...gallery] : gallery;

        if (typeof heroData?.name === "string" && heroData.name.trim()) {
          updated.name = heroData.name;
        }
        if (
          typeof heroData?.description === "string" &&
          heroData.description.trim()
        ) {
          updated.description = heroData.description;
        }
        if (
          typeof details?.duration === "string" &&
          details.duration.trim()
        ) {
          updated.duration = details.duration;
        }
        if (
          typeof details?.groupSize === "string" &&
          details.groupSize.trim()
        ) {
          updated.maxStudents = details.groupSize;
        }
        if (
          typeof details?.location === "string" &&
          details.location.trim()
        ) {
          updated.location = details.location;
        }
        if (typeof details?.rating === "number") {
          updated.rating = details.rating;
        }
        if (typeof details?.reviewCount === "number") {
          updated.reviewCount = details.reviewCount;
        }
        if (mergedImages.length) {
          updated.images = mergedImages;
        }

        const heroHighlights = Array.isArray(heroData?.highlights)
          ? heroData.highlights.filter(
              (item: unknown): item is string =>
                typeof item === "string" && item.trim().length > 0,
            )
          : [];

        if (heroHighlights.length) {
          updated.highlights = heroHighlights;
        }

        const rawHeroPrice = heroData?.pricing?.basePrice;
        if (typeof rawHeroPrice === "number" && Number.isFinite(rawHeroPrice)) {
          heroPrice = rawHeroPrice;
          updated.price = rawHeroPrice;
        } else if (typeof rawHeroPrice === "string") {
          const parsed = Number.parseFloat(rawHeroPrice);
          if (Number.isFinite(parsed)) {
            heroPrice = parsed;
            updated.price = parsed;
          }
        }
      }

      if (isDiscoverScuba) {
        const fallbackPrice =
          typeof updated.price === "number" && Number.isFinite(updated.price)
            ? updated.price
            : undefined;
        const resolvedPrice =
          heroPrice ??
          (typeof initialPrice === "number" && Number.isFinite(initialPrice)
            ? initialPrice
            : undefined) ??
          fallbackPrice ??
          225;
        const normalizedPrice =
          typeof resolvedPrice === "number" && Number.isFinite(resolvedPrice)
            ? resolvedPrice
            : 225;

        updated = {
          ...updated,
          name: "Try Scuba",
          description: "Today - $225",
          duration: "1 Day",
          maxStudents: "4 Max",
          certification: "Includes Everything",
          highlights: [
            "Gear Fitting, Pool Training, Coral Reef Dives",
            "Dive to depths of 18-40ft with a certified instructor",
            "All gear, instruction, and boat fees included",
          ],
          price: normalizedPrice,
        };
      }

      return updated;
    });
  }, [heroData, isDiscoverScuba, initialPrice]);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById(
      "certification-booking-section",
    );
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "intermediate":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "advanced":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-white/20 text-white border-white/30";
    }
  };

  const priceDisplay = Number.isFinite(currentCourse.price)
    ? formatCurrency(currentCourse.price)
    : formatCurrency(225);
  const quickInfoTiles = [
    {
      icon: Clock,
      label: "Duration",
      value: currentCourse.duration,
    },
    {
      icon: Users,
      label: "Class Size",
      value: currentCourse.maxStudents,
    },
    {
      icon: MapPin,
      label: "Location",
      value: currentCourse.location,
    },
    {
      icon: Award,
      label: isDiscoverScuba ? "Includes" : "Certification",
      value: isDiscoverScuba
        ? "Everything Included"
        : currentCourse.certification,
    },
  ];
  const ctaLabel = isDiscoverScuba
    ? `Try Scuba Today - ${priceDisplay}`
    : `Start Your Certification - ${priceDisplay}`;

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0f766e 100%)",
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: `url("${heroImageUrl || currentCourse.images[0]}")`,
        }}
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-white/5 rounded-full -top-48 -right-48"></div>
        <div className="absolute w-64 h-64 bg-blue-500/10 rounded-full -bottom-32 -left-32"></div>
      </div>

      <div className="relative container mx-auto px-4 pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Breadcrumb */}
            <nav className="text-sm text-white/70 mb-4">
              <span>Certifications</span> /{" "}
              <span className="text-white">{currentCourse.name}</span>
            </nav>

            {/* Error banner when product name unavailable */}
            {!currentCourse.name && (
              <div className="mb-4 rounded-md bg-red-600/20 border border-red-600/40 text-white p-3">
                Error: Product name unavailable. Please refresh or try again
                later.
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 flex items-center gap-2">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F68f4a1ac67f04a54a4e3914e4b66253f?format=webp&width=800"
                  alt="PADI Logo"
                  className="w-5 h-5 object-contain"
                />
                🏆 PADI 5★ Center
              </Badge>
              <Badge className={getBadgeColor(currentCourse.level)}>
                📚 {currentCourse.level} Level
              </Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                ✓ All Equipment Included
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              {currentCourse.name}
            </h1>

            {/* Description */}
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              {currentCourse.description}
            </p>

            {/* Star Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <span className="text-white/90">{currentCourse.rating}/5</span>
              <span className="text-white/70">
                ({currentCourse.reviewCount} reviews)
              </span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {quickInfoTiles.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                >
                  <Icon className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                  <div className="text-sm text-white/90">{label}</div>
                  <div className="font-semibold">{value}</div>
                </div>
              ))}
            </div>

            {/* Key Selling Points */}
            <div className="space-y-3 mb-8">
              {currentCourse.highlights.slice(0, 3).map((highlight, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-white/90">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={scrollToBooking}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 text-lg rounded-xl shadow-lg"
            >
              {ctaLabel}
              <ArrowDown className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      <CertificationDetailsModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        courseData={currentCourse}
      />
    </section>
  );
}
