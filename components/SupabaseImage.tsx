import Image from "next/image";
import clsx from "clsx";
import {
  getResponsiveImage,
  ResponsiveImageOptions,
} from "../lib/supabase-images";

interface SupabaseImageProps
  extends Omit<ResponsiveImageOptions, "generatePlaceholder"> {
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  sizes?: string;
  showPlaceholder?: boolean;
}

export async function SupabaseImage({
  alt,
  className,
  priority = false,
  loading = "lazy",
  sizes,
  showPlaceholder = true,
  ...options
}: SupabaseImageProps) {
  const data = await getResponsiveImage({
    ...options,
    generatePlaceholder: showPlaceholder,
  });

  const resolvedSizes = sizes || data.sizes;

  return (
    <picture>
      {data.sources.map((source) => (
        <source
          key={source.type}
          type={source.type}
          srcSet={source.srcSet}
          sizes={resolvedSizes}
        />
      ))}
      <Image
        src={data.defaultSrc}
        alt={alt}
        width={options.width}
        height={options.height}
        className={clsx(className)}
        priority={priority}
        loading={priority ? "eager" : loading}
        sizes={resolvedSizes}
        placeholder={data.placeholderDataUrl ? "blur" : undefined}
        blurDataURL={data.placeholderDataUrl}
        unoptimized
      />
    </picture>
  );
}
