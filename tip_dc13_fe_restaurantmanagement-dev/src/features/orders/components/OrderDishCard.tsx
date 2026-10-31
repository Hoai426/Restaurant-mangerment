"use client";

import React from "react";
import type { Dish } from "@/types/dish";
import { formatCurrency } from "@/utils/format";
import { CakeIcon } from "@heroicons/react/24/outline";

export interface OrderDishCardProps {
  dish: Dish;
  currentQuantity: number;
  onAdd: (dish: Dish) => void;
}

export function OrderDishCard({
  dish,
  currentQuantity,
  onAdd,
}: OrderDishCardProps) {
  const isAvailable = dish.isAvailable;

  const handleClick = () => {
    if (isAvailable) {
      onAdd(dish);
    }
  };

  return (
    <div
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-disabled={!isAvailable}
      aria-label={`${dish.name}, giá ${formatCurrency(dish.price)}${!isAvailable ? ", hết món" : ""}`}
      className={`group relative flex items-center gap-3 bg-white rounded-xl border p-2.5 transition-all select-none ${
        isAvailable
          ? "border-gray-200/80 hover:border-rms-burgundy/40 hover:shadow-md hover:bg-amber-50/10 active:scale-[0.98] cursor-pointer"
          : "border-gray-200 bg-gray-100/70 opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Hình ảnh món ăn & Badge số lượng */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isAvailable ? "group-hover:scale-105" : "grayscale"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <CakeIcon className="w-8 h-8" />
          </div>
        )}

        {/* Lớp phủ Hết món màu đậm, tương phản cao */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-1 z-10">
            <span className="text-[10px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider text-center shadow-sm">
              Hết món
            </span>
          </div>
        )}
      </div>

      {/* Badge số lượng ở góc trên bên phải thẻ (không che hình món ăn) */}
      {currentQuantity > 0 && isAvailable && (
        <div className="absolute top-2 right-2 min-w-[20px] h-5 px-1.5 rounded-full bg-rms-burgundy text-white font-mono font-bold text-[11px] shadow-sm flex items-center justify-center z-10 animate-scale-in">
          {currentQuantity}
        </div>
      )}

      {/* Thông tin món */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4
            className="text-xs sm:text-sm font-bold text-gray-900 truncate pr-6 group-hover:text-rms-burgundy transition-colors"
            title={dish.name}
          >
            {dish.name}
          </h4>

          {dish.categories && dish.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {dish.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-xs sm:text-sm font-bold text-rms-burgundy">
            {formatCurrency(dish.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderDishCard;
