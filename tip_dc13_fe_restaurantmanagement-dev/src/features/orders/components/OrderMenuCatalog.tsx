"use client";

import React, { useState, useMemo } from "react";
import { useDishes } from "@/features/dishes/hooks/useDishes";
import { useCategories } from "@/features/categories/hooks/useCategories";
import OrderDishCard from "./OrderDishCard";
import type { Dish } from "@/types/dish";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";

export interface OrderMenuCatalogProps {
  onAddDish: (dish: Dish) => void;
  getItemQuantity: (dishId: number) => number;
}

export function OrderMenuCatalog({
  onAddDish,
  getItemQuantity,
}: OrderMenuCatalogProps) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: dishes = [], isLoading: isDishesLoading } = useDishes();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  // Lọc món ăn theo từ khóa và danh mục
  const filteredDishes = useMemo(() => {
    let result = dishes;

    // 1. Lọc theo danh mục
    if (selectedCategoryId !== null) {
      result = result.filter(
        (dish) =>
          dish.categories &&
          dish.categories.some((cat) => cat.id === selectedCategoryId)
      );
    }

    // 2. Lọc theo từ khóa tìm kiếm (case-insensitive)
    if (searchKeyword.trim() !== "") {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((dish) =>
        dish.name.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [dishes, selectedCategoryId, searchKeyword]);

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* 1. Thanh công cụ: Tabs Danh mục song song với Ô Tìm kiếm (Điểm 3 Mentor) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-1 border-b border-gray-100/80 shrink-0">
        {/* Dải tab danh mục món ăn (Scrollable horizontal) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1 min-w-0 pr-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategoryId === null
                ? "bg-rms-burgundy text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            Tất cả ({dishes.length})
          </button>

          {!isCategoriesLoading &&
            categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rms-burgundy text-white shadow-2xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
        </div>

        {/* Ô tìm kiếm compact song song */}
        <div className="relative shrink-0 sm:w-48 md:w-56">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm món ăn..."
            className="w-full text-xs pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rms-burgundy/30 focus:border-rms-burgundy transition-all"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Lưới hiển thị danh sách món ăn */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 min-h-0">
        {isDishesLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white rounded-xl border border-gray-100 animate-pulse flex items-center gap-3"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  <div className="h-3.5 bg-gray-100 rounded w-1/3 pt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          // Empty State
          <div className="py-12 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 my-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <CakeIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">
              Không tìm thấy món ăn phù hợp
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {searchKeyword
                ? `Không có món nào chứa từ khóa "${searchKeyword}". Hãy thử tìm kiếm từ khóa khác.`
                : "Danh mục này hiện chưa có món ăn nào."}
            </p>
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="mt-3 text-xs font-semibold text-rms-burgundy hover:underline cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          // Dish Cards Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredDishes.map((dish) => (
              <OrderDishCard
                key={dish.id}
                dish={dish}
                currentQuantity={getItemQuantity(dish.id)}
                onAdd={onAddDish}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderMenuCatalog;
