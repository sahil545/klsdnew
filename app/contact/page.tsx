"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Badge } from "../../client/components/ui/badge";
import { Card, CardContent } from "../../client/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage/5 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-ocean to-ocean/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-coral/20 text-coral border-coral/30 text-lg px-4 py-2">
              Let&apos;s Dive Together
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Contact Key Largo Scuba Diving
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Ready to explore the underwater wonders of the Florida Keys? Get
              in touch with our expert team today.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="text-center group hover:shadow-xl transition-all duration-300 border-ocean/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ocean/20 transition-colors">
                  <Phone className="w-8 h-8 text-ocean" />
                </div>
                <h3 className="text-2xl font-bold text-ocean mb-4">Call Us</h3>
                <p className="text-gray-600 mb-4">
                  Speak directly with our dive experts
                </p>
                <p className="text-xl font-semibold text-ocean">
                  (305) 391-4040
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  365 days • 7:30am – 11:00pm EST
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-xl transition-all duration-300 border-ocean/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ocean/20 transition-colors">
                  <Mail className="w-8 h-8 text-ocean" />
                </div>
                <h3 className="text-2xl font-bold text-ocean mb-4">Email Us</h3>
                <p className="text-gray-600 mb-4">
                  Get detailed information and quotes
                </p>
                <p className="text-xl font-semibold text-ocean">
                  <a
                    href="mailto:dive@keylargoscubadiving.com"
                    className="hover:underline"
                  >
                    dive@keylargoscubadiving.com
                  </a>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-xl transition-all duration-300 border-ocean/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ocean/20 transition-colors">
                  <MapPin className="w-8 h-8 text-ocean" />
                </div>
                <h3 className="text-2xl font-bold text-ocean mb-4">Visit Us</h3>
                <p className="text-gray-600 mb-4">Come see our dive center</p>
                <p className="text-xl font-semibold text-ocean">
                  Key Largo Scuba Diving
                </p>
                <p className="text-ocean font-semibold">
                  102900 Overseas Hwy #6
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Key Largo, FL 33037
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
