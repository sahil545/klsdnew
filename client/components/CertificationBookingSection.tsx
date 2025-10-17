import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import CertificationDetailsModal from "@/components/CertificationDetailsModal";
import SimpleDatePicker from "@/components/SimpleDatePicker";
import { useWordPressCartFunctions } from "@/hooks/useWooCommerceProduct-enhanced";
import { getWooCommerceConfig } from "@/lib/woocommerce-config";
import {
  Calendar,
  Star,
  Plus,
  Minus,
  CheckCircle,
  Users,
  DollarSign,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";

interface CourseOption {
  title: string;
  description: string;
  price: number;
  features: string[];
  maxStudents: number;
  popular?: boolean;
}

// Course options and upgrades
const courseOptions: CourseOption[] = [
  {
    title: "Standard Group Class",
    description: "Traditional group certification with up to 6 students",
    price: 399,
    features: [
      "Group instruction with max 6 students",
      "All equipment included",
      "PADI certification",
      "4-day course schedule",
    ],
    maxStudents: 6,
  },
  {
    title: "Semi Private Class",
    description: "Smaller group with personalized attention",
    price: 549,
    features: [
      "Small group - max 3 students",
      "More personalized instruction",
      "Flexible scheduling options",
      "All equipment included",
      "PADI certification",
    ],
    maxStudents: 3,
    popular: true,
  },
  {
    title: "Private Class",
    description: "One-on-one instruction tailored to your pace",
    price: 799,
    features: [
      "Individual instruction",
      "Custom pace and schedule",
      "Premium equipment options",
      "Choice of instructor",
      "PADI certification",
    ],
    maxStudents: 1,
  },
  {
    title: "Private Boat",
    description: "Exclusive boat charter for your certification",
    price: 1299,
    features: [
      "Private boat charter",
      "Choose your dive sites",
      "Custom schedule",
      "Premium equipment included",
      "Dedicated instructor",
      "PADI certification",
    ],
    maxStudents: 4,
  },
];

export default function CertificationBookingSection({
  productId,
  defaultPrice,
}: {
  productId?: number;
  defaultPrice?: number;
}) {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentCount, setStudentCount] = useState(1);
  const [selectedOption, setSelectedOption] = useState<CourseOption | null>(
    null,
  );

  // Person types from WooCommerce booking (used to map students to person types)
  const [personTypes, setPersonTypes] = useState<
    Array<{
      id: number;
      name: string;
      description: string;
      base_cost: string;
      block_cost: string;
      min: string;
      max: string;
    }>
  >([]);
  const [personTypeCounts, setPersonTypeCounts] = useState<
    Array<{ id: number; count: number; name: string }>
  >([]);

  // Live base price fetched from WooCommerce/Product API
  const [basePrice, setBasePrice] = useState<number | null>(
    typeof defaultPrice === "number" && Number.isFinite(defaultPrice)
      ? defaultPrice
      : null,
  );
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
          (json?.product?.price as unknown) ??
          (json?.product?.tourData?.pricing?.basePrice as unknown);
        const numeric =
          typeof rawPrice === "number"
            ? rawPrice
            : Number.parseFloat(String(rawPrice));
        if (!cancelled && Number.isFinite(numeric)) setBasePrice(numeric);
      } catch {
        // ignore network/API errors; component will fall back to default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Date/time selection connected to WooCommerce availability
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const handleDateSelect = (
    date: Date,
    timeSlot: any,
    loadedPersonTypes?: any[],
  ) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    if (Array.isArray(loadedPersonTypes) && loadedPersonTypes.length) {
      setPersonTypes(loadedPersonTypes as any);
    }
  };

  // Get price from selected option or use live base price (fallback to 399)
  const pricePerStudent = selectedOption?.price || (basePrice ?? 399);
  const subtotal = studentCount * pricePerStudent;

  const { addToCart } = useWordPressCartFunctions();

  const handleEnrollClick = () => {
    setShowStudentModal(true);
  };

  async function handleEnrollSubmit(payload: {
    students: any[];
    courseData?: any;
    selectedOption?: any;
  }) {
    if (typeof productId !== "number") return;

    // Prefer WordPress global when available (Trips/Tours behavior)
    if (typeof window !== "undefined" && (window as any).klsdAddToCart) {
      try {
        await (window as any).klsdAddToCart(
          productId,
          studentCount,
          payload.students || [],
        );
        return;
      } finally {
        setShowStudentModal(false);
      }
    }

    // Fallback: submit real form POST directly to WordPress origin (not this Next route)
    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${getWooCommerceConfig.url}/`;

      const addToCart = document.createElement("input");
      addToCart.type = "hidden";
      addToCart.name = "add-to-cart";
      addToCart.value = String(productId);
      form.appendChild(addToCart);

      const qty = document.createElement("input");
      qty.type = "hidden";
      qty.name = "quantity";
      qty.value = String(studentCount || 1);
      form.appendChild(qty);

      const guests = document.createElement("input");
      guests.type = "hidden";
      guests.name = "klsd_guest_data";
      guests.value = JSON.stringify(payload.students || []);
      form.appendChild(guests);

      document.body.appendChild(form);
      form.submit();
    } finally {
      setShowStudentModal(false);
    }
  }

  // Keep person type counts in sync with current selection
  useEffect(() => {
    if (personTypes && personTypes.length > 0) {
      setPersonTypeCounts([
        {
          id: personTypes[0].id,
          name: personTypes[0].name,
          count: studentCount,
        },
      ]);
    } else {
      setPersonTypeCounts([]);
    }
  }, [personTypes, studentCount]);

  return (
    <section
      id="certification-booking-section"
      className="py-16 bg-white border-t border-gray-100"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Schedule Your Certification
          </h2>
          <p className="text-gray-600">
            Starting at ${pricePerStudent} per student • Small classes, expert
            instruction
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Side - Course Schedule Selection */}
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Course Details
              </h3>

              {/* Date & Time Selection */}
              {typeof productId === "number" ? (
                <div className="mb-6">
                  <SimpleDatePicker
                    productId={productId}
                    onDateSelect={handleDateSelect}
                    onPersonTypesLoaded={(pts) => setPersonTypes(pts)}
                    selectedDate={selectedDate || undefined}
                    selectedTimeSlot={selectedTimeSlot || undefined}
                  />
                </div>
              ) : null}

              {/* Student Count */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Number of Students
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStudentCount(Math.max(1, studentCount - 1))
                    }
                    className="h-12 w-12 p-0 border-gray-300 rounded-full"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="text-center">
                    <div className="font-bold text-3xl text-gray-900">
                      {studentCount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {studentCount === 1 ? "student" : "students"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStudentCount(
                        Math.min(
                          selectedOption?.maxStudents || 6,
                          studentCount + 1,
                        ),
                      )
                    }
                    className="h-12 w-12 p-0 border-gray-300 rounded-full"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Flexible rescheduling up to 48 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.9/5 rating from 300+ certified divers</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Best price guarantee in Key Largo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Pricing & Enrollment */}
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Course Pricing & Enrollment
              </h3>

              {/* Price Display */}
              <div className="text-center mb-6 p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-700 mb-2">
                  ${pricePerStudent.toFixed(2)}
                </div>
                <div className="text-gray-600">
                  per student (before taxes/fees)
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>
                    ${pricePerStudent} × {studentCount}{" "}
                    {studentCount === 1 ? "student" : "students"}
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Taxes and fees calculated at checkout based on WooCommerce
                  settings.
                </div>
              </div>

              {/* Enroll Button */}
              <Button
                onClick={handleEnrollClick}
                disabled={!(selectedDate && selectedTimeSlot)}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 text-lg rounded-lg mb-4"
              >
                Enroll Now - ${subtotal.toFixed(2)}
              </Button>

              <div className="text-center text-sm text-gray-500 mb-2">
                Secure your spot with just a $100 deposit
              </div>
              <div className="text-center text-sm text-gray-500 mb-4">
                {selectedDate && selectedTimeSlot
                  ? "You'll be redirected to secure checkout"
                  : "Select your preferred date and time above"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Details Modal */}
      <CertificationDetailsModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        studentCount={studentCount}
        totalPrice={Number.isFinite(subtotal) ? subtotal : 0}
        selectedOption={selectedOption}
        selectedDate={
          selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined
        }
        selectedTime={selectedTimeSlot?.from}
        personTypes={personTypes}
        personTypeCounts={personTypeCounts}
        productIdNumber={typeof productId === "number" ? productId : undefined}
      />
    </section>
  );
}
