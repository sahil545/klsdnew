/*
  WooCommerce AJAX helpers for Next.js (Netlify proxy compatible)
  - Uses relative /?wc-ajax=... so Netlify redirects forward to WordPress
  - Sends cookies with credentials: 'include' to preserve WC session
  - Automatically attaches the expected `security` nonce when available
  - Gracefully handles JSON or text responses
*/

export type Dict = Record<string, string | number | boolean | undefined | null>;

function toURLSearchParams(
  input?: FormData | Dict | HTMLFormElement | null,
): URLSearchParams {
  if (!input) return new URLSearchParams();

  if (input instanceof HTMLFormElement) {
    const fd = new FormData(input);
    return toURLSearchParams(fd);
  }

  if (input instanceof FormData) {
    const params = new URLSearchParams();
    for (const [k, v] of input.entries()) {
      if (typeof v === "string") params.append(k, v);
      else params.append(k, (v as File).name || "");
    }
    return params;
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  return params;
}

function pickNonce(action: string, explicit?: string): string | undefined {
  if (explicit) return explicit;
  // Common Woo globals (when on cart/checkout pages)
  const w: any = typeof window !== "undefined" ? window : {};

  // Cart page params
  const cartParams = w.wc_cart_params || w.woocommerce_params || {};
  // Checkout page params
  const checkoutParams = w.wc_checkout_params || {};
  // Custom shim user added in functions.php
  const custom = (w.WooCommerce as any) || {};

  switch (action) {
    case "apply_coupon":
      return (
        cartParams.apply_coupon_nonce ||
        custom.apply_coupon_nonce ||
        cartParams.cart_nonce // fallback if present
      );
    case "update_cart":
      return (
        cartParams.update_cart_nonce ||
        cartParams.cart_nonce ||
        custom.update_cart_nonce
      );
    case "update_order_review":
      return (
        checkoutParams.update_order_review_nonce || custom.update_order_nonce
      );
    default:
      return undefined;
  }
}

async function wcAjax<T = any>(
  action: string,
  body?: URLSearchParams,
  opts?: RequestInit,
): Promise<T | string> {
  const url = `/?wc-ajax=${encodeURIComponent(action)}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include", // send cookies to Netlify origin → forwarded to WP
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      ...(opts?.headers || {}),
    },
    body: body?.toString() || undefined,
    cache: "no-store",
    ...opts,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `WC AJAX ${action} failed: ${res.status} ${res.statusText} — ${text.slice(0, 500)}`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text; // some actions return HTML
  }
}

// Apply a coupon on the cart page
export async function applyCoupon(
  couponCode: string,
  opts?: { security?: string },
) {
  const security = pickNonce("apply_coupon", opts?.security);
  const params = new URLSearchParams();
  if (security) params.set("security", security);
  params.set("coupon_code", couponCode);
  // Woo expects "_wp_http_referer" sometimes; not strictly required, but helps
  if (typeof window !== "undefined")
    params.set("_wp_http_referer", window.location.pathname || "/cart/");
  return wcAjax("apply_coupon", params);
}

// Update the cart (quantities etc.). Pass a form element (from <form class="woocommerce-cart-form">) or a dict/FormData
export async function updateCart(
  input: HTMLFormElement | FormData | Dict,
  opts?: { security?: string },
) {
  const security = pickNonce("update_cart", opts?.security);
  const params = toURLSearchParams(input as any);
  if (security) params.set("security", security);
  // Woo looks for "update_cart" presence on manual submits
  if (!params.has("update_cart")) params.set("update_cart", "Update cart");
  return wcAjax("update_cart", params);
}

// Checkout order review refresh. Provide either the checkout form or a pre-serialized post_data
export async function updateOrderReview(
  input: { form?: HTMLFormElement; postData?: string; extra?: Dict },
  opts?: { security?: string },
) {
  const security = pickNonce("update_order_review", opts?.security);
  const params = new URLSearchParams();
  if (security) params.set("security", security);

  let postData = input?.postData;
  if (!postData && input?.form) {
    const formParams = toURLSearchParams(input.form);
    postData = formParams.toString();
  }
  if (postData) params.set("post_data", postData);

  // Optional, but improves totals refresh logic
  if (input?.extra) {
    for (const [k, v] of Object.entries(input.extra)) {
      if (v !== undefined && v !== null) params.set(k, String(v));
    }
  }

  // Shipping methods or payment method can be included if known
  // params.set('shipping_method[0]', 'flat_rate:1');
  // params.set('payment_method', 'stripe');

  return wcAjax("update_order_review", params);
}

// Low-level helper if you need another wc-ajax action
export async function callWcAjax(
  action: string,
  data?: FormData | Dict | HTMLFormElement,
  opts?: { security?: string; request?: RequestInit },
) {
  const params = toURLSearchParams(data as any);
  const security = pickNonce(action, opts?.security);
  if (security) params.set("security", security);
  return wcAjax(action, params, opts?.request);
}
