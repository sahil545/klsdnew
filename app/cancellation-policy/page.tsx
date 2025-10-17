import React from "react";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";

export const dynamic = "force-dynamic";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Cancellation Policy</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Weather</h2>
            <p className="text-gray-700">
              Weather is unpredictable. In regards to diving in the Florida Keys we are focused primarily on wind speed and direction. There are times when it is beautiful on land but due to offshore winds it is too dangerous and trips are cancelled for safety. In the event conditions are sportier than normal you will be given the option to reschedule to a different day or receive a 5 year raincheck.  If a trip runs as scheduled there are ZERO REFUNDS, NO EXCEPTIONS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Rescheduling</h2>
            <p className="text-gray-700">
              You may reschedule at anytime up until 72 hours before departure. Inside of 72 hours we will do our best but cannot guarantee last minute rescheduling. We will do the best we can. If you reschedule within 72 hours of departure your sale is then final and no refunds will be provided for any reason. Please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Refund Policy</h2>
            <p className="text-gray-700">
              All refunds are subject to 6% processing fee including when trips are cancelled due to weather. In the event of weather cancellation rainchecks are offered and are valid for 5 years.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Cancellations For Snorkeling Trips &amp; Dive Trips</h2>
            <p className="text-gray-700">
              You may cancel your trip anytime more than 7 days before your departure date. There will be a 10% processing fee.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Cancellations For E-Learning</h2>
            <p className="text-gray-700">
              All E-Learning is 100% NONREFUNDABLE at time of purchase. THERE ARE ZERO EXCEPTIONS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Cancellations For Diver Training &amp; Certification</h2>
            <p className="text-gray-700">
              No cancelations are allowed within 14 days of departure.
            </p>
            <p className="text-gray-700">
              ALL CANCELED DIVER TRAINING, CERTIFICATION CLASSES, REFRESHER CLASSES, AND TRY SCUBA DIVING/DISCOVER SCUBA DIVING CLASSES ARE SUBJECT TO A 18% CANCELLATION FEE
            </p>
          </section>

          <section className="mb-8">
            <p className="text-gray-700">There are absolutely no refunds for seasickness.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Disputed Credit Card Transactions</h2>
            <p className="text-gray-700">
              ALL WRONGFULLY DISPUTED CREDIT CARD TRANSACTIONS ARE SUBJECT TO A $750 ADMINISTRATION FEE IN ADDITION TO THE CHARGE DISUPTED. PLEASE CONTACT US TO RESOLVE THE MATTER
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
