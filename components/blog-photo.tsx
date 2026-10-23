import Image from "next/image";

import type { BlogImage } from "@/lib/blog-image";

export function BlogPhoto({
  image,
  alt,
  fill = false,
  sizes,
  preload = false,
  className,
}: {
  image: Pick<BlogImage, "src" | "alt" | "width" | "height">;
  alt?: string;
  fill?: boolean;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const altText = alt ?? image.alt;

  if (fill) {
    return (
      <Image
        src={image.src}
        alt={altText}
        fill
        sizes={sizes}
        preload={preload}
        className={className ?? "object-cover"}
      />
    );
  }

  return (
    <Image
      src={image.src}
      alt={altText}
      width={image.width}
      height={image.height}
      sizes={sizes}
      preload={preload}
      className={className}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
