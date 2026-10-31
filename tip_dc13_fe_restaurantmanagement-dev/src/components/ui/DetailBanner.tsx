"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { isDirectUrl } from "@/utils/image-validation";

export interface DetailBannerProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function DetailBanner({
  src,
  alt,
  className = "",
  fallbackText = "Chưa có hình ảnh minh họa",
}: DetailBannerProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative w-full aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          onError={() => setImageError(true)}
          unoptimized={isDirectUrl(src)}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
          <PhotoIcon className="w-12 h-12" strokeWidth={1.5} />
          <span className="text-xs text-gray-400 mt-2 font-medium">
            {fallbackText}
          </span>
        </div>
      )}
    </div>
  );
}

export default DetailBanner;
