import { NextRequest, NextResponse } from "next/server";
import { wooCommerce } from "../../../../client/lib/woocommerce";
import { loadProductTemplateByProductId } from "../../../../lib/product-templates";
import { convertWooCommerceToTourData } from "../../../../lib/woo-to-tour-data";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const idParam = params.id;
  const productId = Number.parseInt(idParam, 10);
  if (Number.isNaN(productId)) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid product id: ${idParam}`,
      },
      { status: 400 },
    );
  }

  try {
    const supabaseTemplate = await loadProductTemplateByProductId(productId);
    if (supabaseTemplate) {
      const categories = supabaseTemplate.categories || [];
      const isTestingCategory = categories.some(
        (cat) =>
          (cat?.slug && ["testing-category", "testing"].includes(cat.slug)) ||
          (cat?.name && cat.name === "Testing Category"),
      );

      // Also fetch live WooCommerce price/stock to ensure accurate pricing
      let livePrice: number | null = null;
      let liveStock: number | null = null;
      try {
        const wooResponse = await fetch(
          `https://keylargoscubadiving.com/wp-json/wc/v3/products/${productId}?_fields=price,stock_quantity`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                "ck_d0e9e6f20a1ecc40f797058c27e46aee21bf10b9:cs_3d3aa1c520bd3687d83ae3932b70683a7126af28",
              ).toString("base64")}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );
        if (wooResponse.ok) {
          const wooProduct = await wooResponse.json();
          const numeric = Number.parseFloat(String(wooProduct?.price ?? ""));
          livePrice = Number.isFinite(numeric) ? numeric : null;
          liveStock =
            typeof wooProduct?.stock_quantity === "number"
              ? wooProduct.stock_quantity
              : null;
        }
      } catch {}

      return NextResponse.json({
        success: true,
        source: livePrice !== null ? "supabase+woocommerce" : "supabase",
        product: {
          tourData: supabaseTemplate.tourData,
          isTestingCategory,
          name:
            supabaseTemplate.tourData.name ||
            supabaseTemplate.record.name ||
            undefined,
          price: livePrice,
          stock: liveStock,
        },
      });
    }

    console.log(
      `Supabase template missing for ${productId}, falling back to WooCommerce`,
    );

    // Try direct WooCommerce API call for live data
    const wooResponse = await fetch(
      `https://keylargoscubadiving.com/wp-json/wc/v3/products/${idParam}?_fields=id,name,categories,price,stock_quantity,stock_status,images,meta_data,wcf_tour_data`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            "ck_d0e9e6f20a1ecc40f797058c27e46aee21bf10b9:cs_3d3aa1c520bd3687d83ae3932b70683a7126af28",
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (wooResponse.ok) {
      const wooProduct = await wooResponse.json();
      console.log(`✅ Live WooCommerce data fetched: ${wooProduct.name}`);

      // Prefer server-provided tour data from plugin if available
      const wcfTour: any | null = (wooProduct as any).wcf_tour_data ?? null;

      const categories = wooProduct.categories || [];
      const isTestingCategory =
        categories.some(
          (cat: any) =>
            cat.name === "Testing Category" || cat.slug === "testing-category",
        ) || productId === 34592;

      const tourData =
        (wcfTour as any) || convertWooCommerceToTourData(wooProduct);

      return NextResponse.json({
        success: true,
        source: wcfTour ? "live_woocommerce_wcf" : "live_woocommerce_converted",
        product: {
          tourData,
          isTestingCategory,
          name: wooProduct.name,
          price: wooProduct.price,
          stock: wooProduct.stock_quantity,
        },
      });
    }

    console.log("Direct WooCommerce API failed, trying legacy method...");

    // Fallback to legacy WooCommerce client with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("API_TIMEOUT")), 5000);
    });

    const response = await Promise.race([
      wooCommerce.makeRequest(`/products/${idParam}`),
      timeoutPromise,
    ]);

    // Extract duration from KLSD Duration Test plugin meta data
    const metaData = response.meta_data || [];
    const durationMeta = metaData.find(
      (meta: any) => meta.key === "_klsd_test_duration",
    );
    const duration = durationMeta ? durationMeta.value : "XX NO"; // Fallback when no plugin data

    // Check if product is in Testing Category
    const categories = response.categories || [];
    const isTestingCategory = categories.some(
      (cat: any) =>
        cat.name === "Testing Category" || cat.slug === "testing-category",
    );

    // If plugin provided tour data, use it directly
    const legacyWcf: any | null = (response as any).wcf_tour_data ?? null;
    if (legacyWcf) {
      return NextResponse.json({
        success: true,
        source: "legacy_api_wcf",
        product: {
          tourData: legacyWcf,
          isTestingCategory,
          name: response.name,
          price: response.price,
          stock: response.stock_quantity,
        },
      });
    }

    // Format data for snorkeling tour template (fallback conversion)
    const templateData = {
      id: response.id,
      name: response.name,
      description: response.description,
      short_description: response.short_description,
      price: response.price,
      regular_price: response.regular_price,
      categories: categories,
      tourData: {
        name: response.name,
        description: response.short_description || response.description,
        images: {
          hero:
            response.images?.[0]?.src ||
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
          gallery: response.images?.map((img: any) => img.src) || [],
        },
        categories: categories.map((cat: any) => cat.name),
        details: {
          duration: duration === "XX NO" ? duration : `${duration} Hours`,
          groupSize: "25 Max",
          location: "Key Largo",
          gearIncluded: true,
          rating: 4.9,
          reviewCount: 487,
        },
        pricing: {
          basePrice: parseFloat(response.price || "70"),
          taxRate: 0.07,
          currency: "USD",
        },
      },
    };

    return NextResponse.json({
      success: true,
      source: "legacy_api_converted",
      product: {
        ...templateData,
        isTestingCategory,
      },
    });
  } catch (error) {
    console.error("Product Data API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isCorsError =
      errorMessage.includes("CORS Error") ||
      errorMessage.includes("Failed to fetch");
    const isTimeoutError = errorMessage.includes("API_TIMEOUT");

    let message = "Failed to fetch product data";
    if (isCorsError) {
      message =
        "CORS blocked during development - this will work when deployed";
    } else if (isTimeoutError) {
      message = `Using fallback mock data for product ${idParam} due to: ${errorMessage}`;
      console.log(message);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        isCorsError,
        isTimeoutError,
        message,
        source: "error_fallback",
      },
      { status: 200 },
    ); // Return 200 to prevent body stream issues
  }
}
