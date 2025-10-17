import React from "react";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";

export const dynamic = "force-dynamic";

export default function RescueDiverCertificationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Rescue Diver Certification</h1>
          <p className="text-gray-600">Coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
