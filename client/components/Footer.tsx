"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HOME_IMAGES } from "../../lib/generated/home-images";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Star,
  Waves,
  Fish,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-deep-water text-foam" suppressHydrationWarning>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={HOME_IMAGES.logo}
                alt="Key Largo Scuba Diving Logo"
                className="h-16 w-auto"
              />
            </div>

            <p className="text-foam/80 leading-relaxed mb-6 max-w-md">
              Experience the magic of Key Largo's underwater world with our
              award-winning Christ of the Abyss snorkeling tours. Creating
              unforgettable memories since 2008.
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-coral fill-coral" />
                <Star className="w-4 h-4 text-coral fill-coral" />
                <Star className="w-4 h-4 text-coral fill-coral" />
                <Star className="w-4 h-4 text-coral fill-coral" />
                <Star className="w-4 h-4 text-coral fill-coral" />
                <span className="text-foam/80 text-sm ml-2">
                  4.9/5 (500+ reviews)
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-4">
              <div className="bg-foam/10 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-foam">
                  PADI PROFESSIONALS
                </span>
              </div>
              <div className="bg-foam/10 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-foam">
                  SCUBAPRO DEALER
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-foam mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-ocean flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foam/80 text-sm">
                    <span className="font-medium text-foam block">
                      Key Largo Scuba Diving
                    </span>
                    102900 Overseas Hwy #6
                    <br />
                    Key Largo, FL 33037
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-ocean" />
                <a
                  href="tel:305-391-4040"
                  className="text-foam/80 hover:text-foam transition-colors"
                >
                  (305) 391-4040
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-ocean" />
                <a
                  href="mailto:dive@keylargoscubadiving.com"
                  className="text-foam/80 hover:text-foam transition-colors"
                >
                  dive@keylargoscubadiving.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-ocean flex-shrink-0 mt-0.5" />
                <div className="text-foam/80 text-sm">
                  <p className="font-medium text-foam">Hours:</p>
                  <p>365 days per year • 7:30am - 11:00pm EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Social */}
          <div>
            <h4 className="text-lg font-semibold text-foam mb-6">
              Follow Our Adventures
            </h4>

            {/* Social Media */}
            <div className="flex gap-3 mb-6">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-foam/20 text-foam hover:bg-foam hover:text-deep-water"
              >
                <a
                  href="https://www.facebook.com/Keylargoscubadiving/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-foam/20 text-foam hover:bg-foam hover:text-deep-water"
              >
                <a
                  href="https://www.youtube.com/@keylargoscubadiving"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Youtube className="w-4 h-4" /> YouTube
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-foam/20 text-foam hover:bg-foam hover:text-deep-water"
              >
                <a
                  href="https://www.instagram.com/keylargoscubadiving/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              </Button>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 mb-8">
              <Link
                href="/trips-tours"
                className="block text-foam/80 hover:text-foam transition-colors text-sm"
              >
                Trips & Tours
              </Link>
              <Link
                href="/certification"
                className="block text-foam/80 hover:text-foam transition-colors text-sm"
              >
                Certification
              </Link>
              <Link
                href="/key-largo-dive-sites"
                className="block text-foam/80 hover:text-foam transition-colors text-sm"
              >
                Dive Sites
              </Link>
              <Link
                href="/dive-shop-key-largo"
                className="block text-foam/80 hover:text-foam transition-colors text-sm"
              >
                Scuba Gear
              </Link>
              <Link
                href="/contact-us"
                className="block text-foam/80 hover:text-foam transition-colors text-sm"
              >
                Contact
              </Link>
            </div>

            {/* Newsletter */}
            <div className="mt-6 p-4 bg-foam/5 rounded-lg border border-foam/10">
              <h5 className="text-sm font-semibold text-foam mb-2">
                Stay Updated
              </h5>
              <p className="text-xs text-foam/70 mb-3">
                Get tips, marine life updates, and special offers
              </p>
              <Button
                size="sm"
                className="bg-ocean hover:bg-ocean/90 text-white w-full"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-foam/20" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-foam/70">
            <p>&copy; 2025 Key Largo Scuba Diving. All rights reserved.</p>
            <a href="#" className="hover:text-foam transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foam transition-colors">
              Terms of Service
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-foam/70">
            <Fish className="w-4 h-4 text-ocean" />
            <span>Protecting marine life since 2008</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
