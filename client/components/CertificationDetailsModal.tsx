"use client";
import { getWooCommerceConfig } from "@/lib/woocommerce-config";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CreditCard, ArrowLeft, User, X } from "lucide-react";

interface CertificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (customerData: any) => Promise<void> | void;
  isLoading?: boolean;
  packageDetails?: any;
  studentCount?: number;
  selectedDate?: string;
  selectedTime?: string;
  totalPrice?: number;
  customFormFields?: {
    products: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  };
  personTypes?: Array<{
    id: number;
    name: string;
    description: string;
    base_cost: string;
    block_cost: string;
    min: string;
    max: string;
  }>;
  personTypeCounts?: Array<{ id: number; count: number; name: string }>;
  onRentalGearUpdate?: (
    passengerIndex: number,
    productId: string,
    isSelected: boolean,
  ) => void;
  rentalGearSelections?: {
    [passengerIndex: number]: Record<string, boolean>;
  };
  productIdNumber?: number;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  certificationLevel?: string;
  lastDiveDate?: string;
  hireGuide?: string;
  regulatorRental?: boolean;
  bcdRental?: boolean;
  fullGearRental?: boolean;
  rentalGear?: Record<string, boolean>;
}

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  location: string;
  specialRequests: string;
}

export default function CertificationDetailsModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  packageDetails,
  studentCount,
  selectedDate,
  selectedTime,
  totalPrice,
  customFormFields,
  personTypes,
  personTypeCounts,
  onRentalGearUpdate,
  rentalGearSelections,
  productIdNumber,
}: CertificationDetailsModalProps) {
  const formattedTotal = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(totalPrice ?? 0);

  const [formData, setFormData] = useState<LeadFormData>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    phone: "",
    location: "",
    specialRequests: "",
  });

  const [isScreenLoading, setIsScreenLoading] = useState(false);

  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    Array.from({ length: studentCount || 0 }, () => ({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      certificationLevel: "",
      lastDiveDate: "",
      hireGuide: "",
      regulatorRental: false,
      bcdRental: false,
      fullGearRental: false,
      rentalGear: {},
    })),
  );

  // Keep passengers array in sync with studentCount
  useEffect(() => {
    setPassengers((prev) =>
      Array.from({ length: studentCount || 0 }, (_, index) => {
        const existing = prev?.[index];
        const isLead = index === 0;
        return {
          firstName: existing?.firstName ?? (isLead ? formData.firstName : ""),
          lastName: existing?.lastName ?? (isLead ? formData.lastName : ""),
          dateOfBirth:
            existing?.dateOfBirth ?? (isLead ? formData.dateOfBirth : ""),
          email: existing?.email ?? (isLead ? formData.email : ""),
          certificationLevel: existing?.certificationLevel || "",
          lastDiveDate: existing?.lastDiveDate || "",
          hireGuide: existing?.hireGuide || "",
          regulatorRental: existing?.regulatorRental || false,
          bcdRental: existing?.bcdRental || false,
          fullGearRental: existing?.fullGearRental || false,
          rentalGear:
            rentalGearSelections?.[index] || existing?.rentalGear || {},
        };
      }),
    );
  }, [
    studentCount,
    rentalGearSelections,
    formData.firstName,
    formData.lastName,
    formData.dateOfBirth,
    formData.email,
  ]);

  const updatePassenger = (
    index: number,
    field: keyof PassengerInfo,
    value: string | boolean | Record<string, boolean>,
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );

    if (
      index === 0 &&
      typeof value === "string" &&
      (field === "firstName" ||
        field === "lastName" ||
        field === "email" ||
        field === "dateOfBirth")
    ) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const isFormValid = () => {
    const expectedCount = studentCount ?? passengers.length;
    if (!expectedCount) return true;
    if (passengers.length < expectedCount) return false;

    return passengers
      .slice(0, expectedCount)
      .every(
        (p) =>
          p.firstName?.trim() &&
          p.lastName?.trim() &&
          p.email?.trim() &&
          p.dateOfBirth?.trim(),
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      const expectedCount = studentCount ?? passengers.length;
      const missingFields: string[] = [];

      passengers.slice(0, expectedCount).forEach((student, index) => {
        const labelPrefix = `Student ${index + 1}`;
        if (!student.firstName?.trim())
          missingFields.push(`${labelPrefix} First Name`);
        if (!student.lastName?.trim())
          missingFields.push(`${labelPrefix} Last Name`);
        if (!student.email?.trim()) missingFields.push(`${labelPrefix} Email`);
        if (!student.dateOfBirth?.trim())
          missingFields.push(`${labelPrefix} Date of Birth`);
      });

      if (passengers.length < expectedCount) {
        for (let i = passengers.length; i < expectedCount; i += 1) {
          missingFields.push(`Student ${i + 1} Details`);
        }
      }

      alert(
        `Please fill in the following required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    const leadStudent = passengers[0];
    const leadFirstName = leadStudent?.firstName || formData.firstName;
    const leadLastName = leadStudent?.lastName || formData.lastName;
    const leadEmail = leadStudent?.email || formData.email;
    const leadDateOfBirth = leadStudent?.dateOfBirth || formData.dateOfBirth;
    const leadFullName = [leadFirstName, leadLastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    setIsScreenLoading(true);

    try {
      const calculateRentalGearCost = () => {
        let totalRentalCost = 0;
        Object.values(rentalGearSelections || {}).forEach((passengerGear) => {
          Object.entries(passengerGear).forEach(([productId, isSelected]) => {
            if (isSelected && customFormFields?.products) {
              const product = customFormFields.products.find(
                (p: any) => p.id === productId,
              );
              if (product) {
                totalRentalCost += product.price;
              }
            }
          });
        });
        return totalRentalCost;
      };

      const rentalGearCost = calculateRentalGearCost();

      const wooCommerceData: Record<string, any> = {
        "add-to-cart": productIdNumber,
        quantity: studentCount,

        wc_bookings_field_start_date_year: selectedDate
          ? new Date(selectedDate).getFullYear().toString()
          : "2025",
        wc_bookings_field_start_date_month: selectedDate
          ? (new Date(selectedDate).getMonth() + 1).toString().padStart(2, "0")
          : "10",
        wc_bookings_field_start_date_day: selectedDate
          ? new Date(selectedDate).getDate().toString().padStart(2, "0")
          : "20",
        wc_bookings_field_start_date_time: selectedDate
          ? (() => {
              const [hour, rest] = (selectedTime || "08:30").split(":");
              const isPM = rest && rest.toLowerCase().includes("pm");
              let hourNum = parseInt(hour);
              if (isPM && hourNum !== 12) hourNum += 12;
              if (!isPM && hourNum === 12) hourNum = 0;
              const minute = rest ? rest.split(" ")[0] : "30";
              return `${selectedDate}T${hourNum.toString().padStart(2, "0")}:${minute.padStart(2, "0")}:00-0400`;
            })()
          : "2025-10-20T08:30:00-0400",

        wc_bookings_field_start_date: selectedDate || "2025-10-20",
        wc_bookings_field_start_date_hour: selectedTime
          ? (() => {
              const [hour, rest] = selectedTime.split(":");
              const isPM = rest && rest.toLowerCase().includes("pm");
              let hourNum = parseInt(hour);
              if (isPM && hourNum !== 12) hourNum += 12;
              if (!isPM && hourNum === 12) hourNum = 0;
              return hourNum.toString().padStart(2, "0");
            })()
          : "08",
        wc_bookings_field_start_date_minute: selectedTime
          ? selectedTime.split(":")[1].split(" ")[0].padStart(2, "0")
          : "30",

        ...(() => {
          const personFields: { [key: string]: number } = {};
          if (personTypeCounts && personTypeCounts.length > 0) {
            personTypeCounts.forEach((pt) => {
              personFields[`wc_bookings_field_persons_${pt.id}`] = pt.count;
            });
          } else if (personTypes && personTypes.length > 0) {
            personFields[`wc_bookings_field_persons_${personTypes[0].id}`] =
              studentCount;
          }
          return personFields;
        })(),

        tmcp_textfield_0: leadFullName || leadFirstName || leadLastName || "",
        tmcp_textfield_3: formData.location || "",
        tmcp_textarea_4: formData.specialRequests || "",
        klsd_lead_date_of_birth: leadDateOfBirth || "",
        klsd_lead_email: leadEmail || "",

        ...passengers.slice(1).reduce(
          (acc, passenger, index) => {
            const actualIndex = index + 1;
            const displayIndex = index + 2;
            let baseFieldIndex;
            if (actualIndex === 1) baseFieldIndex = 6;
            else if (actualIndex === 2) baseFieldIndex = 11;
            else if (actualIndex === 3) baseFieldIndex = 16;
            else if (actualIndex === 4) baseFieldIndex = 21;
            else baseFieldIndex = 21 + (actualIndex - 4) * 5;

            acc[`tmcp_textfield_${baseFieldIndex}`] =
              `${passenger.firstName} ${passenger.lastName}`;
            if (passenger.certificationLevel)
              acc[`tmcp_select_${baseFieldIndex + 1}`] =
                passenger.certificationLevel;
            if (passenger.lastDiveDate)
              acc[`tmcp_select_${baseFieldIndex + 2}`] = passenger.lastDiveDate;
            acc[`tmcp_textfield_date_of_birth_${displayIndex}`] = passenger.dateOfBirth || "";
            acc[`tmcp_textfield_email_${displayIndex}`] = passenger.email || "";
            return acc;
          },
          {} as Record<string, any>,
        ),

        ...Object.entries(rentalGearSelections || {}).reduce(
          (acc, [passengerIndex, gearSelections]) => {
            const selectedProductIds = Object.entries(gearSelections)
              .filter(([_, isSelected]) => isSelected)
              .map(([productId, _]) => productId);

            if (selectedProductIds.length > 0) {
              selectedProductIds.forEach((productId, addonIndex) => {
                let baseFieldNumber, addonIndexForField;
                const idx = parseInt(passengerIndex);
                if (idx === 0) {
                  baseFieldNumber = 5;
                  addonIndexForField = addonIndex;
                } else if (idx === 1) {
                  baseFieldNumber = 10;
                  addonIndexForField = addonIndex + 2;
                } else {
                  baseFieldNumber = 15 + (idx - 2) * 5;
                  addonIndexForField = addonIndex + 4 + (idx - 2) * 2;
                }

                acc[`tmcp_product_${baseFieldNumber}_${addonIndexForField}`] =
                  productId;
                acc[
                  `tmcp_product_${baseFieldNumber}_${addonIndexForField}_quantity`
                ] = "1";
              });
            }
            return acc;
          },
          {} as Record<string, any>,
        ),

        booking_guest_count: studentCount.toString(),
        booking_total_price: totalPrice?.toString() || "0",
        booking_rental_cost: rentalGearCost.toString(),
      };

      const bookingData = {
        lead_guest: {
          firstName: leadFirstName || "",
          lastName: leadLastName || "",
          email: leadEmail || "",
          dateOfBirth: leadDateOfBirth || "",
          phone: formData.phone,
          location: formData.location,
          specialRequests: formData.specialRequests,
        },
        passengers: passengers.map((passenger, index) => ({
          passengerIndex: index,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth:
            index === 0 ? leadDateOfBirth || "" : passenger.dateOfBirth || "",
          email: index === 0 ? leadEmail || "" : passenger.email || "",
          certificationLevel: passenger.certificationLevel,
          lastDiveDate: passenger.lastDiveDate,
          hireGuide: passenger.hireGuide,
          rentalGear: passenger.rentalGear,
          rentalGearSelections: rentalGearSelections?.[index] || {},
        })),
        booking_details: {
          guestCount: studentCount,
          selectedDate: selectedDate,
          selectedTime: selectedTime,
          totalPrice: totalPrice,
          rentalGearCost: rentalGearCost,
          customFormFields: customFormFields,
          rentalGearSelections: rentalGearSelections,
        },
        wooCommerceData: wooCommerceData,
        submittedAt: new Date().toISOString(),
      };

      localStorage.setItem("pendingBookingData", JSON.stringify(bookingData));

      await handleWooCommerceBooking(wooCommerceData);
    } catch (error) {
      setIsScreenLoading(false);
      console.error("Enrollment error:", error);
      alert(
        "There was a problem processing your enrollment. Please try again.",
      );
    }
  };

  const submitFormToWooCommerce = (wooCommerceData: any) => {
    const site_url =
      getWooCommerceConfig.url ||
      process.env.NEXT_PUBLIC_WORDPRESS_URL ||
      "https://keylargoscubadiving.com";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${site_url}/cart/`;
    form.style.display = "none";

    const addToCartInput = document.createElement("input");
    addToCartInput.type = "hidden";
    addToCartInput.name = "add-to-cart";
    addToCartInput.value = String(productIdNumber || "");
    form.appendChild(addToCartInput);

    const quantityInput = document.createElement("input");
    quantityInput.type = "hidden";
    quantityInput.name = "quantity";
    quantityInput.value = String(studentCount || 1);
    form.appendChild(quantityInput);

    Object.entries(wooCommerceData).forEach(([key, value]) => {
      if (value && value !== "") {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }
    });

    const iframe = document.createElement("iframe");
    iframe.name = "wooCartFrame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    form.target = "wooCartFrame";
    document.body.appendChild(form);

    form.submit();

    setTimeout(() => {
      window.location.href = `${site_url}/checkout/`;
    }, 3500);

    setTimeout(() => {
      try {
        document.body.removeChild(form);
      } catch {}
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 5000);
  };

  const handleWooCommerceBooking = async (wooCommerceData: any) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isWordPressContext = urlParams.get("wordpress") === "1";

    if (isWordPressContext) {
      window.parent.postMessage(
        {
          type: "KLSD_ADD_TO_CART",
          productId: productIdNumber,
          wooCommerceData,
          guestCount: studentCount,
          selectedDate,
          selectedTime,
          totalPrice,
          leadDateOfBirth: formData.dateOfBirth,
          leadEmail: formData.email,
          add_to_cart: productIdNumber,
          quantity: studentCount,
          wc_bookings_field_start_date_year:
            wooCommerceData["wc_bookings_field_start_date_year"],
          wc_bookings_field_start_date_month:
            wooCommerceData["wc_bookings_field_start_date_month"],
          wc_bookings_field_start_date_day:
            wooCommerceData["wc_bookings_field_start_date_day"],
          wc_bookings_field_start_date_time:
            wooCommerceData["wc_bookings_field_start_date_time"],
          ...passengers.slice(1).reduce(
            (acc, passenger, index) => {
              const actualIndex = index + 1;
              const displayIndex = index + 2;
              let baseFieldIndex;
              if (actualIndex === 1) baseFieldIndex = 6;
              else if (actualIndex === 2) baseFieldIndex = 11;
              else if (actualIndex === 3) baseFieldIndex = 16;
              else if (actualIndex === 4) baseFieldIndex = 21;
              else baseFieldIndex = 21 + (actualIndex - 4) * 5;

              acc[`tmcp_textfield_${baseFieldIndex}`] =
                `${passenger.firstName} ${passenger.lastName}`;
              if (passenger.certificationLevel)
                acc[`tmcp_select_${baseFieldIndex + 1}`] =
                  passenger.certificationLevel;
              if (passenger.lastDiveDate)
                acc[`tmcp_select_${baseFieldIndex + 2}`] =
                  passenger.lastDiveDate;
              acc[`tmcp_textfield_date_of_birth_${displayIndex}`] = passenger.dateOfBirth || "";
              acc[`tmcp_textfield_email_${displayIndex}`] = passenger.email || "";
              return acc;
            },
            {} as Record<string, any>,
          ),

          ...Object.entries(rentalGearSelections || {}).reduce(
            (acc, [passengerIndex, gearSelections]) => {
              const selectedProductIds = Object.entries(gearSelections)
                .filter(([_, selected]) => selected)
                .map(([productId]) => productId);

              selectedProductIds.forEach((productId, addonIndex) => {
                let baseFieldNumber, addonIndexForField;
                const idx = parseInt(passengerIndex);
                if (idx === 0) {
                  baseFieldNumber = 5;
                  addonIndexForField = addonIndex;
                } else if (idx === 1) {
                  baseFieldNumber = 10;
                  addonIndexForField = addonIndex + 2;
                } else {
                  baseFieldNumber = 15 + (idx - 2) * 5;
                  addonIndexForField = addonIndex + 4 + (idx - 2) * 2;
                }

                acc[`tmcp_product_${baseFieldNumber}_${addonIndexForField}`] =
                  productId;
                acc[
                  `tmcp_product_${baseFieldNumber}_${addonIndexForField}_quantity`
                ] = "1";
              });

              return acc;
            },
            {} as Record<string, any>,
          ),
        },
        "*",
      );
    } else {
      submitFormToWooCommerce(wooCommerceData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <Users className="w-6 h-6 text-ocean" />
              Student Details - Scuba Certification
            </h2>
            <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="bg-ocean/5 border-ocean/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-ocean" />
                Enrollment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Course Date:</span>
                <span className="font-semibold">
                  {selectedDate || "Date to be selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Course Time:</span>
                <span className="font-semibold">
                  {selectedTime || "8:00 AM"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Students:</span>
                <span className="font-semibold">
                  {studentCount} {studentCount === 1 ? "Student" : "Students"}
                </span>
              </div>
              {packageDetails && (
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-semibold">{packageDetails.name}</span>
                </div>
              )}
              <div className="flex justify-between text-lg border-t pt-2">
                <span>Total (incl. tax):</span>
                <span className="font-bold text-ocean">{formattedTotal}</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            {studentCount > 0 && passengers.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passengers.map((p, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {`Student ${i + 1}`}
                      </h4>
                      <div className="space-y-6">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <Label>First Name *</Label>
                            <Input
                              value={p.firstName}
                              onChange={(e) =>
                                updatePassenger(i, "firstName", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={p.lastName}
                              onChange={(e) =>
                                updatePassenger(i, "lastName", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={p.email || ""}
                              onChange={(e) =>
                                updatePassenger(i, "email", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>Date of Birth *</Label>
                            <Input
                              type="date"
                              value={p.dateOfBirth || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  i,
                                  "dateOfBirth",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </div>

                        {customFormFields?.products &&
                          customFormFields.products.length > 0 && (
                            <div className="space-y-4">
                              <h5 className="font-semibold text-gray-700">
                                Optional Add-ons
                              </h5>
                              <div className="grid md:grid-cols-3 gap-4">
                                {customFormFields.products
                                  .filter(
                                    (product, index, self) =>
                                      index ===
                                      self.findIndex(
                                        (p) => p.id === product.id,
                                      ),
                                  )
                                  .map((product) => (
                                    <div
                                      key={product.id}
                                      className="flex items-start gap-3"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`gear-${product.id}-${i}`}
                                        checked={
                                          p.rentalGear?.[product.id] || false
                                        }
                                        onChange={(e) => {
                                          updatePassenger(i, "rentalGear", {
                                            ...p.rentalGear,
                                            [product.id]: e.target.checked,
                                          });
                                          if (onRentalGearUpdate) {
                                            onRentalGearUpdate(
                                              i,
                                              product.id,
                                              e.target.checked,
                                            );
                                          }
                                        }}
                                        className="mt-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <div>
                                        <label
                                          htmlFor={`gear-${product.id}-${i}`}
                                          className="text-xs font-medium text-gray-700"
                                        >
                                          {product.name}
                                        </label>
                                        <p className="text-sm text-blue-600">
                                          ${product.price.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isScreenLoading}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Booking
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-coral hover:bg-coral/90 text-white"
              >
                {isScreenLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Enroll Students - {formattedTotal}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
