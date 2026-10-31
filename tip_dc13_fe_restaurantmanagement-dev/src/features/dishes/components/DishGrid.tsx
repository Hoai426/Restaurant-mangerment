"use client";

import React from "react";
import type { Dish } from "@/types/dish";
import type { Category } from "@/types/category";
import { DishCard } from "./DishCard";
import { CakeIcon } from "@heroicons/react/24/outline";

export interface DishGridProps {
  dishes: Dish[];
  categories?: Category[];
  onSelectDish: (dish: Dish) => void;
}

export function DishGrid({ dishes, categories, onSelectDish }: DishGridProps) {
  if (dishes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mb-3">
          <CakeIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-rms-charcoal">
          Không tìm thấy món ăn nào
        </h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Không có món ăn nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          categories={categories}
          onClick={onSelectDish}
        />
      ))}
    </div>
  );
}
export default DishGrid;
