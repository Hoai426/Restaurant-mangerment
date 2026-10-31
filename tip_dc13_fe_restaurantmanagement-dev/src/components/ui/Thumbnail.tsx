"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { isDirectUrl } from "@/utils/image-validation";

export interface ThumbnailProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const SIZE_MAP = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

const DIMENSION_MAP = {
  sm: 32,
  md: 40,
  lg: 56,
};

const ICON_SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

export function Thumbnail({
  src,
  alt,
  size = "md",
  className = "",
  fallbackIcon,
}: ThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const iconSizeClass = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.md;
  const dimension = DIMENSION_MAP[size] || DIMENSION_MAP.md;

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClasses} bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 ${className}`}
        aria-hidden="true"
      >
        {fallbackIcon || <PhotoIcon className={iconSizeClass} strokeWidth={1.5} />}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      onError={() => setHasError(true)}
      unoptimized={isDirectUrl(src)}
      className={`${sizeClasses} object-cover shrink-0 border border-gray-100 ${className}`}
    />
  );
}

export default Thumbnail;
