"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ClipboardList,
  Footprints,
  HeartPulse,
  Info,
  MessageCircle,
  Ruler,
  Shield,
  User,
  Users,
  Weight,
} from "lucide-react";

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCount?: number;
  courseName?: string;
  selectedDate?: string;
  selectedTime?: string;
  basePrice?: number;
}

interface GearPackage {
  id: string;
  name: string;
  description: string;
  includes: string[];
  price: number;
  popular?: boolean;
}

interface GearItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface StudentInfo {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  certificationLevel: string;
  lastTrainingMonth: string;
  lastTrainingYear: string;
  height: string;
  weight: string;
  shoeSize: string;
  gearPackage: string | null;
  gearItems: string[];
  medicalConcerns: string;
  medications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  eLearningStatus: string;
  notes: string;
}

const certificationLevels = [
  "None / Brand New",
  "Discover Scuba Completed",
  "Scuba Diver (Junior)",
  "Open Water Diver",
  "Advanced Open Water",
  "Rescue Diver",
  "Other",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const gearPackages: GearPackage[] = [
  {
    id: "full-rental",
    name: "Full Gear Rental",
    description: "BCD, regulator set, wetsuit, mask, fins, snorkel",
    includes: [
      "Perfect for students without equipment",
      "Sized during enrollment",
      "Includes weights",
    ],
    price: 95,
    popular: true,
  },
  {
    id: "soft-gear",
    name: "Soft Gear Package",
    description: "Mask, snorkel, fins, boots",
    includes: [
      "Ideal for students with personal BCD/regulator",
      "Keeps sizing consistent",
      "Boots included",
    ],
    price: 55,
  },
  {
    id: "hard-gear",
    name: "Hard Gear Package",
    description: "BCD and regulator set",
    includes: [
      "Pair with your own mask and fins",
      "Inspected daily",
      "Alternate air source",
    ],
    price: 70,
  },
];

const gearItems: GearItem[] = [
  {
    id: "mask-snorkel",
    name: "Mask & Snorkel",
    description: "Premium low-volume mask with dry snorkel",
    price: 20,
  },
  {
    id: "fins",
    name: "Open-Heel Fins",
    description: "Adjustable strap fins sized to shoe size",
    price: 18,
  },
  {
    id: "boots",
    name: "Neoprene Boots",
    description: "3mm neoprene for comfort and fit",
    price: 15,
  },
  {
    id: "wetsuit",
    name: "3mm Wetsuit",
    description: "Keeps you warm during open water dives",
    price: 32,
  },
];

const services: ServiceOption[] = [
  {
    id: "private-instructor",
    name: "Private Instructor Upgrade",
    description: "1:1 instruction for the entire course",
    price: 195,
  },
  {
    id: "academic-session",
    name: "Extra Academic Tutoring",
    description: "60-minute classroom review before open water",
    price: 65,
  },
  {
    id: "pool-refresher",
    name: "Pool Refresher Session",
    description: "Optional extra pool evening for comfort",
    price: 80,
  },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => (currentYear - i).toString());

export default function StudentEnrollmentLegacyModal({
  isOpen,
  onClose,
  studentCount = 1,
  courseName = "PADI Open Water Diver",
  selectedDate,
  selectedTime,
  basePrice = 399,
}: StudentEnrollmentModalProps) {
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [step, setStep] = useState<"form" | "review" | "confirmation">("form");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>(() =>
    Array.from({ length: Math.max(studentCount, 1) }).map(() => ({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      certificationLevel: "None / Brand New",
      lastTrainingMonth: "",
      lastTrainingYear: "",
      height: "",
      weight: "",
      shoeSize: "",
      gearPackage: null,
      gearItems: [],
      medicalConcerns: "",
      medications: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      eLearningStatus: "Not Started",
      notes: "",
    })),
  );

  useEffect(() => {
    if (studentCount <= 0) return;
    setStudents((prev) => {
      if (prev.length === studentCount) return prev;
      if (prev.length < studentCount) {
        return [
          ...prev,
          ...Array.from({ length: studentCount - prev.length }).map(() => ({
            fullName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            certificationLevel: "None / Brand New",
            lastTrainingMonth: "",
            lastTrainingYear: "",
            height: "",
            weight: "",
            shoeSize: "",
            gearPackage: null,
            gearItems: [],
            medicalConcerns: "",
            medications: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            eLearningStatus: "Not Started",
            notes: "",
          })),
        ];
      }
      return prev.slice(0, studentCount);
    });
    setCurrentStudentIndex((prev) => Math.min(prev, Math.max(studentCount - 1, 0)));
  }, [studentCount]);

  const currentStudent = students[currentStudentIndex];

  const updateStudent = <K extends keyof StudentInfo>(field: K, value: StudentInfo[K]) => {
    setStudents((prev) =>
      prev.map((student, index) =>
        index === currentStudentIndex ? { ...student, [field]: value } : student,
      ),
    );
  };

  const toggleGearItem = (itemId: string) => {
    const hasItem = currentStudent.gearItems.includes(itemId);
    const updated = hasItem
      ? currentStudent.gearItems.filter((id) => id !== itemId)
      : [...currentStudent.gearItems, itemId];
    updateStudent("gearItems", updated);
    if (updated.length > 0) {
      updateStudent("gearPackage", null);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const isCurrentStudentComplete = () => {
    const requiredFields: Array<keyof StudentInfo> = [
      "fullName",
      "email",
      "phone",
      "height",
      "weight",
      "shoeSize",
      "emergencyContactName",
      "emergencyContactPhone",
    ];

    const missingRequired = requiredFields.some((field) =>
      (currentStudent[field] as string).trim().length === 0,
    );

    if (missingRequired) return false;

    if (!currentStudent.gearPackage && currentStudent.gearItems.length === 0) {
      return false;
    }

    return true;
  };

  const areAllStudentsComplete = () => {
    return students.every((_, index) => {
      const previous = currentStudentIndex;
      setCurrentStudentIndex(index);
      const result = isCurrentStudentComplete();
      setCurrentStudentIndex(previous);
      return result;
    });
  };

  const handleNext = () => {
    if (!isCurrentStudentComplete()) return;
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex((prev) => prev + 1);
    } else if (areAllStudentsComplete()) {
      setStep("review");
    }
  };

  const handlePrevious = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex((prev) => prev - 1);
    }
  };

  const resetModal = () => {
    setCurrentStudentIndex(0);
    setStep("form");
    setSelectedServices([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = async () => {
    setStep("confirmation");
  };

  const formatDateTime = () => {
    if (!selectedDate) return "Date TBD";
    const dateObj = new Date(selectedDate);
    const weekday = dateObj.toLocaleDateString(undefined, { weekday: "long" });
    const month = dateObj.toLocaleDateString(undefined, { month: "long" });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const time = selectedTime
      ? new Date(`${selectedDate}T${selectedTime}`).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "8:00 AM";
    return `${weekday}, ${month} ${day}, ${year} at ${time}`;
  };

  const baseCost = (students.length || 1) * basePrice;

  const gearCost = useMemo(() => {
    return students.reduce((total, student) => {
      if (student.gearPackage) {
        const pkg = gearPackages.find((option) => option.id === student.gearPackage);
        if (pkg) return total + pkg.price;
      }
      const itemsTotal = student.gearItems.reduce((itemTotal, itemId) => {
        const item = gearItems.find((option) => option.id === itemId);
        return item ? itemTotal + item.price : itemTotal;
      }, 0);
      return total + itemsTotal;
    }, 0);
  }, [students]);

  const servicesCost = selectedServices.reduce((total, serviceId) => {
    const service = services.find((option) => option.id === serviceId);
    return service ? total + service.price : total;
  }, 0);

  const tax = (baseCost + gearCost + servicesCost) * 0.07;
  const totalPrice = baseCost + gearCost + servicesCost + tax;

  if (!isOpen) return null;

  if (step === "confirmation") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-emerald-700">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              Enrollment Submitted!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              We received your student enrollment details. Our training team will review everything and email confirmation shortly.
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 mb-1">{courseName}</h4>
              <p className="text-sm text-emerald-700">{formatDateTime()}</p>
              <p className="text-sm text-emerald-700">
                {students.length} {students.length === 1 ? "student" : "students"}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === "review") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Student Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-600" /> Course Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{courseName}</h4>
                  <p className="text-sm text-muted-foreground">{formatDateTime()}</p>
                  <p className="text-sm text-muted-foreground">
                    {students.length} {students.length === 1 ? "Student" : "Students"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-700">
                    ${totalPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mt-2">
                    <div>Course Tuition: ${baseCost.toFixed(2)}</div>
                    {gearCost > 0 && <div>Gear Rental: ${gearCost.toFixed(2)}</div>}
                    {servicesCost > 0 && <div>Services: ${servicesCost.toFixed(2)}</div>}
                    <div>Estimated Tax: ${tax.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" /> Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {students.map((student, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Student {index + 1}</Badge>
                      <span className="font-semibold">{student.fullName || "Name pending"}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p>
                          <strong>Email:</strong> {student.email || "—"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {student.phone || "—"}
                        </p>
                        <p>
                          <strong>DOB:</strong> {student.dateOfBirth || "—"}
                        </p>
                        <p>
                          <strong>Certification:</strong> {student.certificationLevel}
                        </p>
                        <p>
                          <strong>Last Training:</strong>{" "}
                          {student.lastTrainingMonth && student.lastTrainingYear
                            ? `${student.lastTrainingMonth} ${student.lastTrainingYear}`
                            : "Unknown"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p>
                          <strong>Height:</strong> {student.height || "—"}
                        </p>
                        <p>
                          <strong>Weight:</strong> {student.weight || "—"}
                        </p>
                        <p>
                          <strong>Shoe Size:</strong> {student.shoeSize || "—"}
                        </p>
                        <p>
                          <strong>E-Learning:</strong> {student.eLearningStatus}
                        </p>
                        <p>
                          <strong>Medical Notes:</strong> {student.medicalConcerns || "None listed"}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-3 text-sm">
                      {student.gearPackage ? (
                        <p>
                          <strong>Gear Package:</strong>{" "}
                          {gearPackages.find((pkg) => pkg.id === student.gearPackage)?.name}
                        </p>
                      ) : student.gearItems.length > 0 ? (
                        <p>
                          <strong>Gear Items:</strong>{" "}
                          {student.gearItems
                            .map((itemId) => gearItems.find((item) => item.id === itemId)?.name || itemId)
                            .join(", ")}
                        </p>
                      ) : null}
                      <p>
                        <strong>Emergency Contact:</strong>{" "}
                        {student.emergencyContactName || "—"} ({student.emergencyContactPhone || "—"})
                      </p>
                      {student.notes && (
                        <p>
                          <strong>Notes:</strong> {student.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-600" /> Selected Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No optional services selected.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {selectedServices.map((serviceId) => {
                      const service = services.find((option) => option.id === serviceId);
                      if (!service) return null;
                      return (
                        <li key={service.id} className="flex items-center justify-between">
                          <span className="font-medium">{service.name}</span>
                          <span>${service.price.toFixed(2)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Editing
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                Submit Enrollment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Student Enrollment - {currentStudentIndex + 1} of {students.length}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: students.length }, (_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index === currentStudentIndex
                    ? "bg-emerald-500"
                    : index < currentStudentIndex
                      ? "bg-emerald-300"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={currentStudent.fullName}
                    onChange={(e) => updateStudent("fullName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={currentStudent.email}
                    onChange={(e) => updateStudent("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={currentStudent.phone}
                    onChange={(e) => updateStudent("phone", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={currentStudent.dateOfBirth}
                    onChange={(e) => updateStudent("dateOfBirth", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Level
                  </label>
                  <select
                    value={currentStudent.certificationLevel}
                    onChange={(e) => updateStudent("certificationLevel", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {certificationLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Training Month
                  </label>
                  <select
                    value={currentStudent.lastTrainingMonth}
                    onChange={(e) => updateStudent("lastTrainingMonth", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="">Select Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Training Year
                  </label>
                  <select
                    value={currentStudent.lastTrainingYear}
                    onChange={(e) => updateStudent("lastTrainingYear", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> Rental Gear & Sizing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Ruler className="w-4 h-4 inline mr-1" /> Height *
                  </label>
                  <input
                    type="text"
                    value={currentStudent.height}
                    onChange={(e) => updateStudent("height", e.target.value)}
                    placeholder={"5'10\" or 178 cm"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Weight className="w-4 h-4 inline mr-1" /> Weight *
                  </label>
                  <input
                    type="text"
                    value={currentStudent.weight}
                    onChange={(e) => updateStudent("weight", e.target.value)}
                    placeholder="165 lbs or 75 kg"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Footprints className="w-4 h-4 inline mr-1" /> Shoe Size *
                  </label>
                  <input
                    type="text"
                    value={currentStudent.shoeSize}
                    onChange={(e) => updateStudent("shoeSize", e.target.value)}
                    placeholder="9.5 US or 42 EU"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Gear Packages</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {gearPackages.map((pkg) => (
                    <label
                      key={pkg.id}
                      className={`block border rounded-lg p-3 cursor-pointer transition-all ${
                        currentStudent.gearPackage === pkg.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{pkg.name}</span>
                        <span className="text-sm text-emerald-600 font-semibold">
                          ${pkg.price.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{pkg.description}</p>
                      <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                        {pkg.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {pkg.popular && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                          Most Popular
                        </Badge>
                      )}
                      <input
                        type="radio"
                        name={`gear-package-${currentStudentIndex}`}
                        className="sr-only"
                        checked={currentStudent.gearPackage === pkg.id}
                        onChange={() => {
                          updateStudent("gearPackage", pkg.id);
                          updateStudent("gearItems", []);
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Or Select Items Individually</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {gearItems.map((item) => {
                    const selected = currentStudent.gearItems.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-all ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${item.price.toFixed(0)}</span>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selected}
                            onChange={() => toggleGearItem(item.id)}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-800">
                If you select any individual gear items, the package selection above will be cleared automatically.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" /> Health & Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Concerns or Conditions
                  </label>
                  <textarea
                    value={currentStudent.medicalConcerns}
                    onChange={(e) => updateStudent("medicalConcerns", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    placeholder="Asthma, ear issues, recent surgeries, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medications Taken
                  </label>
                  <textarea
                    value={currentStudent.medications}
                    onChange={(e) => updateStudent("medications", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    placeholder="Prescription or over-the-counter medications"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    value={currentStudent.emergencyContactName}
                    onChange={(e) => updateStudent("emergencyContactName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={currentStudent.emergencyContactPhone}
                    onChange={(e) => updateStudent("emergencyContactPhone", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Learning Progress
                  </label>
                  <select
                    value={currentStudent.eLearningStatus}
                    onChange={(e) => updateStudent("eLearningStatus", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Need Access">Need Access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes for Instructors
                  </label>
                  <textarea
                    value={currentStudent.notes}
                    onChange={(e) => updateStudent("notes", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    placeholder="Student goals, learning preferences, accommodations, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {currentStudentIndex === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" /> Optional Services
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3">
                {services.map((service) => {
                  const selected = selectedServices.includes(service.id);
                  return (
                    <label
                      key={service.id}
                      className={`block border rounded-lg p-3 cursor-pointer transition-all ${
                        selected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm">{service.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {service.description}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-600">
                          ${service.price.toFixed(0)}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => toggleService(service.id)}
                      />
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {!isCurrentStudentComplete() && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <div>
                Please complete required fields (name, email, phone, sizing, emergency contact) and select either a gear package or individual gear items before proceeding.
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStudentIndex === 0}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous Student
            </Button>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {formatDateTime()}
            </div>
            <Button
              onClick={handleNext}
              disabled={!isCurrentStudentComplete()}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              {currentStudentIndex === students.length - 1 ? "Review Enrollment" : "Next Student"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
