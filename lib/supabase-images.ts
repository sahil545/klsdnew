import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { supabaseAdmin } from "./supabaseAdmin";

export type ImageFormat = "webp" | "avif";

export type ResponsiveImageOptions = {
  sourceUrl: string;
  width: number;
  height: number;
  cacheKey?: string;
  namespace?: string;
  breakpoints?: number[];
  formats?: ImageFormat[];
  quality?: number;
  maxWidth?: number;
  generatePlaceholder?: boolean;
  targetPath?: string;
};

export type ResponsiveImageSource = {
  srcSet: string;
  type: string;
};

export type ResponsiveImageResult = {
  bucket: string;
  path: string;
  original: string;
  width: number;
  height: number;
  aspectRatio: number;
  defaultSrc: string;
  sources: ResponsiveImageSource[];
  placeholderDataUrl?: string;
  sizes: string;
};

const DEFAULT_BUCKET = process.env.SUPABASE_IMAGES_BUCKET?.trim() || "images";
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const DEFAULT_BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1536, 1920];
const DEFAULT_FORMATS: ImageFormat[] = ["avif", "webp"];
const DEFAULT_QUALITY = 82;
const PLACEHOLDER_WIDTH = 24;
const BUCKET_NOT_FOUND_PATTERN = /bucket not found/i;
const FALLBACK_BUCKET = "external";
const memoryCache = new Map<string, Promise<ResponsiveImageResult>>();
const transformSupportCache = new Map<string, boolean>();

export async function getResponsiveImage(
  options: ResponsiveImageOptions,
): Promise<ResponsiveImageResult> {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL must be configured to use responsive images");
  }

  const key = buildCacheKey(options);
  if (!memoryCache.has(key)) {
    memoryCache.set(key, computeResponsiveImage(options));
  }
  return memoryCache.get(key)!;
}

async function computeResponsiveImage(
  options: ResponsiveImageOptions,
): Promise<ResponsiveImageResult> {
  const {
    sourceUrl,
    width,
    height,
    cacheKey,
    namespace = "ingested",
    breakpoints = DEFAULT_BREAKPOINTS,
    formats = DEFAULT_FORMATS,
    quality = DEFAULT_QUALITY,
    maxWidth = 1920,
    generatePlaceholder = true,
    targetPath,
  } = options;

  const bucket = DEFAULT_BUCKET;
  const supabase = supabaseAdmin();
  const storage = supabase.storage.from(bucket);

  const normalizedSourceUrl = normalizeUrl(sourceUrl);
  const allowedBreakpoints = filterBreakpoints(breakpoints, maxWidth, width);

  if (!isAbsoluteUrl(normalizedSourceUrl)) {
    return buildExternalResult(
      normalizedSourceUrl,
      width,
      height,
      allowedBreakpoints,
    );
  }

  const fileExt = pickExtension(normalizedSourceUrl);
  const hash = cacheKey || hashForSource(normalizedSourceUrl);
  const originalPath = targetPath
    ? normalizeTargetPath(targetPath, fileExt)
    : `${namespace}/${hash}/original.${fileExt}`;
  const folder = originalPath.includes("/")
    ? originalPath.substring(0, originalPath.lastIndexOf("/"))
    : "";

  try {
    await ensureOriginalExists(
      storage,
      originalPath,
      normalizedSourceUrl,
      fileExt,
    );
  } catch (error) {
    if (isBucketNotFoundError(error)) {
      console.warn(
        `[images] Supabase bucket "${bucket}" unavailable; serving source URL directly`,
      );
      return buildExternalResult(
        normalizedSourceUrl,
        width,
        height,
        allowedBreakpoints,
      );
    }
    throw error;
  }

  const renderBase = buildRenderBase(originalPath, bucket);
  const objectBase = buildObjectBase(originalPath, bucket);

  const resolvedQuality = clampQuality(quality);
  let sources = formats.map((format) => ({
    type: `image/${format}`,
    srcSet: buildSrcSet(
      renderBase,
      format,
      allowedBreakpoints,
      resolvedQuality,
    ),
  }));

  const defaultWidth = chooseDefaultWidth(allowedBreakpoints, width, maxWidth);
  const fallbackFormat = formats.includes("webp") ? "webp" : formats[0];
  let defaultSrc = buildTransformUrl(
    renderBase,
    fallbackFormat,
    defaultWidth,
    resolvedQuality,
  );

  const transformsAvailable = await ensureTransformSupport(defaultSrc);

  let placeholderDataUrl: string | undefined;
  if (!transformsAvailable) {
    console.warn(
      `[images] Supabase image transforms unavailable for ${originalPath}; falling back to original asset`,
    );
    defaultSrc = objectBase;
    sources = [];
  } else if (generatePlaceholder) {
    placeholderDataUrl = await buildPlaceholder(renderBase);
  }

  return {
    bucket,
    path: originalPath,
    original: objectBase,
    width,
    height,
    aspectRatio: height ? width / height : 1,
    defaultSrc,
    sources,
    placeholderDataUrl,
    sizes: buildSizesString(allowedBreakpoints, width),
  };
}

async function ensureTransformSupport(url: string) {
  if (transformSupportCache.has(url)) {
    return transformSupportCache.get(url)!;
  }

  const result = await checkTransformAvailability(url);
  transformSupportCache.set(url, result);
  return result;
}

async function checkTransformAvailability(url: string) {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return true;
  } catch (error) {
    console.warn("[images] HEAD request failed for transform URL", {
      url,
      error,
    });
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    if (res.ok) return true;
  } catch (error) {
    console.warn("[images] Transform probe failed", { url, error });
  }

  return false;
}

async function ensureOriginalExists(
  storage: ReturnType<ReturnType<typeof supabaseAdmin>["storage"]["from"]>,
  path: string,
  sourceUrl: string,
  ext: string,
) {
  const directory = path.includes("/")
    ? path.substring(0, path.lastIndexOf("/"))
    : "";
  const filename = path.substring(path.lastIndexOf("/") + 1);

  const { data: objects, error } = await storage.list(directory || undefined, {
    limit: 1,
    search: filename,
  });

  if (!error && objects && objects.length > 0) {
    return;
  }

  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch source image ${sourceUrl}: ${response.status}`,
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType =
    response.headers.get("content-type") || inferContentType(ext);

  const { error: uploadError } = await storage.upload(path, buffer, {
    upsert: false,
    contentType,
    cacheControl: "31536000",
  });

  if (uploadError && uploadError.statusCode !== 409) {
    throw uploadError;
  }
}

function buildRenderBase(path: string, bucket: string) {
  const encodedPath = encodeURIComponentPath(path);
  return `${SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${encodedPath}`;
}

function buildObjectBase(path: string, bucket: string) {
  const encodedPath = encodeURIComponentPath(path);
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

function buildSrcSet(
  base: string,
  format: ImageFormat,
  breakpoints: number[],
  quality: number,
) {
  return breakpoints
    .map(
      (width) => `${buildTransformUrl(base, format, width, quality)} ${width}w`,
    )
    .join(", ");
}

function buildTransformUrl(
  base: string,
  format: ImageFormat,
  width: number,
  quality: number,
) {
  const url = new URL(base);
  url.searchParams.set("format", format);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality));
  url.searchParams.set("resize", "cover");
  return url.toString();
}

async function buildPlaceholder(base: string) {
  try {
    const placeholderUrl = buildTransformUrl(
      base,
      "webp",
      PLACEHOLDER_WIDTH,
      40,
    );
    const res = await fetch(placeholderUrl, {
      cache: "force-cache",
    });
    if (!res.ok) return undefined;
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:image/webp;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.warn("[images] Failed to build placeholder", error);
    return undefined;
  }
}

function buildExternalResult(
  normalizedSourceUrl: string,
  width: number,
  height: number,
  allowedBreakpoints: number[],
): ResponsiveImageResult {
  return {
    bucket: FALLBACK_BUCKET,
    path: normalizedSourceUrl,
    original: normalizedSourceUrl,
    width,
    height,
    aspectRatio: height ? width / height : 1,
    defaultSrc: normalizedSourceUrl,
    sources: [],
    sizes: buildSizesString(allowedBreakpoints, width),
  };
}

function isAbsoluteUrl(url: string) {
  try {
    const parsed = new URL(url);
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
}

function isBucketNotFoundError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as {
    message?: string;
    error?: string;
    statusCode?: number;
    status?: number;
  };
  const message = String(err.message ?? err.error ?? "");
  const statusCode = err.statusCode ?? err.status;
  if (statusCode === 404 && BUCKET_NOT_FOUND_PATTERN.test(message)) {
    return true;
  }
  return BUCKET_NOT_FOUND_PATTERN.test(message);
}

function buildSizesString(breakpoints: number[], desiredWidth: number) {
  if (!breakpoints.length) return `${desiredWidth}px`;
  const sorted = [...breakpoints].sort((a, b) => a - b);
  const largest = sorted[sorted.length - 1];
  return `(max-width: ${largest}px) 100vw, ${Math.max(desiredWidth, largest)}px`;
}

function buildCacheKey(options: ResponsiveImageOptions) {
  const hash = createHash("sha1");
  hash.update(options.cacheKey || options.sourceUrl);
  hash.update(String(options.width));
  hash.update(String(options.height));
  if (options.breakpoints) hash.update(options.breakpoints.join("-"));
  if (options.formats) hash.update(options.formats.join("-"));
  if (options.targetPath) hash.update(options.targetPath);
  return hash.digest("hex");
}

function normalizeTargetPath(path: string, ext: string) {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  if (!trimmed) {
    return `original.${ext}`;
  }
  if (/\.[a-z0-9]+$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}/original.${ext}`;
}

function normalizeUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

function pickExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
  if (!match) return "jpg";
  const ext = match[1].toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "avif"].includes(ext)) {
    return ext === "jpeg" ? "jpg" : ext;
  }
  return "jpg";
}

function hashForSource(url: string): string {
  return createHash("sha1").update(url).digest("hex");
}

function inferContentType(ext: string) {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function encodeURIComponentPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function filterBreakpoints(
  breakpoints: number[],
  maxWidth: number,
  desired: number,
) {
  const max = Math.max(maxWidth, desired);
  return Array.from(new Set([...breakpoints, desired]))
    .filter((bp) => bp > 0 && bp <= max)
    .sort((a, b) => a - b);
}

function clampQuality(value: number) {
  return Math.max(10, Math.min(100, Math.round(value)));
}

function chooseDefaultWidth(
  breakpoints: number[],
  desired: number,
  maxWidth: number,
) {
  if (!breakpoints.length) return Math.min(desired, maxWidth);
  const sorted = [...breakpoints].sort((a, b) => a - b);
  const candidate = sorted.find((bp) => bp >= desired);
  return Math.min(candidate ?? sorted[sorted.length - 1], maxWidth);
}
