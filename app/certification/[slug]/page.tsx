import { notFound } from "next/navigation";
import Navigation from "../../../client/components/Navigation";
import Footer from "../../../client/components/Footer";
import CertificationTemplateEmbedded from "../../../client/pages/CertificationTemplateEmbedded";
import { wooCommerce } from "../../../client/lib/woocommerce";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function getProductBySlug(slug: string): Promise<any | null> {
  try {
    const products = await wooCommerce.makeRequest(
      `/products?slug=${encodeURIComponent(slug)}&per_page=1`,
    );
    if (Array.isArray(products) && products.length > 0) return products[0];
  } catch (e) {}
  return null;
}

export default async function CertificationProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();

  const productId: number = product.id;
  const initialPrice =
    Number.parseFloat(String(product.price ?? "")) || undefined;
  const productName: string | undefined = product.name || undefined;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main>
        <CertificationTemplateEmbedded
          productId={productId}
          initialPrice={initialPrice}
          productName={productName}
        />
      </main>
      <Footer />
    </div>
  );
}
