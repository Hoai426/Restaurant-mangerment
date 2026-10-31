"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Dish } from "@/types/dish";
import type { Category } from "@/types/category";
import { formatCurrency } from "@/utils/format";
import { getCategoryName } from "../helpers/format";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { isDirectUrl } from "@/utils/image-validation";

export interface DishCardProps {
  dish: Dish;
  categories?: Category[];
  onClick: (dish: Dish) => void;
}

export function DishCard({ dish, categories, onClick }: DishCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryLabel = getCategoryName(dish, categories);

  return (
    <button
      type="button"
      onClick={() => onClick(dish)}
      aria-label={`Xem chi tiết món ${dish.name}`}
      className="w-full text-left group bg-white rounded-2xl border border-gray-100/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-rms-gold/50 cursor-pointer"
    >
      {/* Dish Image Banner */}
      <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden shrink-0">
        {dish.imageUrl && !imageError ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized={isDirectUrl(dish.imageUrl)}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <PhotoIcon className="w-10 h-10" strokeWidth={1.5} />
            <span className="text-[11px] text-gray-400 mt-1 font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shadow-sm border ${
              dish.isAvailable
                ? "bg-emerald-500/90 text-white border-emerald-600/30 backdrop-blur-sm"
                : "bg-gray-800/80 text-gray-200 border-gray-700/30 backdrop-blur-sm"
            }`}
          >
            {dish.isAvailable ? "Còn món" : "Tạm hết"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category Tag */}
          <span
            className="inline-block text-xs font-semibold text-amber-800 normal-case truncate max-w-full"
            title={categoryLabel}
          >
            {categoryLabel}
          </span>

          {/* Dish Name */}
          <h3
            className="font-bold text-gray-900 group-hover:text-rms-burgundy transition-colors text-base line-clamp-2 leading-snug"
            title={dish.name}
          >
            {dish.name}
          </h3>

          {/* Short Description */}
          <p
            className="text-xs text-gray-500 line-clamp-2 leading-relaxed"
            title={dish.description?.trim() ? dish.description : undefined}
          >
            {dish.description?.trim() ? dish.description : "Chưa có mô tả chi tiết."}
          </p>
        </div>

        {/* Price Section */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Đơn giá</span>
          <span className="text-base font-bold text-rms-burgundy font-mono">
            {formatCurrency(dish.price)}
          </span>
        </div>
      </div>
    </button>
  );
}
export default DishCard;
