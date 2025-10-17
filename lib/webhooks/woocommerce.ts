import { createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import type { NextRequest } from "next/server";

export type WooWebhookVerificationResult = {
  success: boolean;
  rawBody: Buffer;
  payload: unknown;
  signature?: string;
  computedSignature?: string;
  topic?: string;
  deliveryId?: string;
  reason?: string;
};

export type VerifyWooWebhookOptions = {
  secret: string;
  requireSignature?: boolean;
};

export async function verifyWooWebhook(
  req: NextRequest,
  options: VerifyWooWebhookOptions,
): Promise<WooWebhookVerificationResult> {
  const { secret, requireSignature = true } = options;
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signatureHeader = (req.headers.get("x-wc-webhook-signature") || "").trim();
  const topic = (req.headers.get("x-wc-webhook-topic") || "").trim();
  const deliveryId = (req.headers.get("x-wc-webhook-delivery-id") || "").trim();

  if (!secret || !secret.trim()) {
    return {
      success: false,
      rawBody,
      payload: null,
      signature: signatureHeader,
      computedSignature: undefined,
      topic,
      deliveryId,
      reason: "Missing WooCommerce webhook secret",
    };
  }

  const computedSignature = createHmac("sha256", secret).update(rawBody).digest("base64");

  if (requireSignature) {
    const isValid = safeCompareSignatures(signatureHeader, computedSignature);
    if (!isValid) {
      return {
        success: false,
        rawBody,
        payload: null,
        signature: signatureHeader,
        computedSignature,
        topic,
        deliveryId,
        reason: "Invalid WooCommerce webhook signature",
      };
    }
  }

  let payload: unknown = null;
  if (rawBody.length > 0) {
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch (error) {
      return {
        success: false,
        rawBody,
        payload: null,
        signature: signatureHeader,
        computedSignature,
        topic,
        deliveryId,
        reason: error instanceof Error ? error.message : "Invalid JSON payload",
      };
    }
  }

  return {
    success: true,
    rawBody,
    payload,
    signature: signatureHeader,
    computedSignature,
    topic,
    deliveryId,
  };
}

function safeCompareSignatures(received: string, expected: string): boolean {
  if (!received || !expected) {
    return false;
  }

  try {
    const receivedBuffer = Buffer.from(received, "base64");
    const expectedBuffer = Buffer.from(expected, "base64");

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
