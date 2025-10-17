import type { Metadata } from "next";
import "./globals.css";

import Script from "next/script";

import { ErrorBoundary } from "./components/ErrorBoundary";
import ClientErrorHandler from "./components/ClientErrorHandler";
import NetworkErrorHandler from "./components/NetworkErrorHandler";
import { Navigation } from "../client/components/Navigation";
import { Footer } from "../client/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { getWpMediaByFilename } = await import("../client/lib/wp-media");
  const logo = await getWpMediaByFilename("key-largo-scuba-diving-logo.png");
  const ogImage = logo?.url
    ? [
        {
          url: logo.url,
          width: logo.width,
          height: logo.height,
          alt: logo.alt || logo.title || "Key Largo Scuba Diving",
        },
      ]
    : [];

  const faviconUrl =
    "https://fjrbcurymmoezsthdpar.supabase.co/storage/v1/object/public/wordpress_images/key-largo-scuba-diving-icon.png";
  const faviconType = "image/png";

  const base: Metadata = {
    title: "Key Largo Scuba Diving | Best Key Largo Dive Shop",
    description:
      "Premium scuba diving tours and PADI certification in Key Largo, Florida Keys. Experience the famous Christ of the Abyss statue, coral reefs, and crystal-clear waters. Book your underwater adventure today!",
    keywords:
      "scuba diving, Key Largo, Florida Keys, dive tours, PADI certification, snorkeling, Christ of the Abyss, coral reefs, diving lessons",
    authors: [{ name: "Key Largo Scuba Diving" }],
    creator: "Key Largo Scuba Diving",
    publisher: "Key Largo Scuba Diving",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      title: "Key Largo Scuba Diving | Best Key Largo Dive Shop",
      description:
        "Experience world-famous diving sites in Key Largo, Florida Keys. PADI certified guides, crystal-clear waters, and unforgettable underwater adventures.",
      url: "https://livewsnklsdlaucnh.netlify.app",
      siteName: "Key Largo Scuba Diving",
      type: "website",
      locale: "en_US",
      images: ogImage,
    },
    icons: { icon: [{ url: faviconUrl, type: faviconType }] },
    other: { "deployment-version": "1.0.0" },
    twitter: {
      card: "summary_large_image",
      title: "Key Largo Scuba Diving | Best Key Largo Dive Shop",
      description:
        "Experience world-famous diving sites in Key Largo, Florida Keys",
      images: ogImage.length ? [ogImage[0].url] : [],
    },
  };

  return base;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>{/* Error handling initialization */}</head>
      <body className="antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <ClientErrorHandler />
          <NetworkErrorHandler />
          <main suppressHydrationWarning>{children}</main>
        </ErrorBoundary>
        <Script id="tawk-to" strategy="afterInteractive">{`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/68b7a5c6b27e571923f056e1/1j46lv3i5';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}</Script>
      </body>
    </html>
  );
}
