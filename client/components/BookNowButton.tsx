"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Calendar } from "lucide-react";
import Booking from "./Booking";

interface BookNowButtonProps {
  buttonName?: string;
  text?: string; // Legacy prop for backward compatibility
  size?: "sm" | "lg" | "default";
  variant?: "default" | "outline" | "ghost" | "link";
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  productId?: number;
  fullWidth?: boolean;
}

export default function BookNowButton({
  buttonName,
  text = "Book Now",
  size = "default",
  variant = "default",
  className = "bg-coral hover:bg-coral/90 text-white",
  showIcon = false,
  icon,
  productId = 34450,
  fullWidth = false,
}: BookNowButtonProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openBooking = () => {
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
  };

  const buttonClasses = fullWidth ? "w-full" : "";

  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={`${className} ${buttonClasses}`}
        onClick={openBooking}
      >
        {showIcon && (icon || <Calendar className="w-4 h-4 mr-2" />)}
        {buttonName || text}
      </Button>

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
    </>
  );
}
