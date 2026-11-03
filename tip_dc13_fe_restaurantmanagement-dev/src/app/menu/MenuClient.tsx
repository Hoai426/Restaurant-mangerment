"use client";

import React, { useState, useMemo } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useCategories } from "@/features/categories";
import {
  useDishes,
  DishGrid,
  DishDetailModal,
} from "@/features/dishes";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { useDebounce } from "@/hooks/useDebounce";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { SearchRequest, FilterCriteria } from "@/types/dish";

export default function MenuClient() {
  useRequireAuth(["CUSTOMER"]);

  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);

  const { data: categories = [] } = useCategories();

  // Build filter request dynamically with debounced search
  const searchRequest = useMemo((): SearchRequest => {
    const filters: FilterCriteria[] = [];

    if (debouncedSearchQuery.trim()) {
      filters.push({
        field: "name",
        operation: "LIKE",
        value: debouncedSearchQuery.trim(),
      });
    }

    if (selectedCategoryId !== null) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) {
        filters.push({
          field: "categories.name",
          operation: "EQ",
          value: cat.name,
        });
      }
    }

    if (onlyAvailable) {
      filters.push({
        field: "isAvailable",
        operation: "EQ",
        value: true,
      });
    }

    return { filters };
  }, [debouncedSearchQuery, selectedCategoryId, onlyAvailable, categories]);

  const {
    data: dishes,
    isLoading,
    isError,
    error,
    refetch,
  } = useDishes(searchRequest);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setOnlyAvailable(false);
  };

  const isFiltered =
    Boolean(searchQuery.trim()) || selectedCategoryId !== null || !onlyAvailable;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rms-burgundy to-rms-burgundy-light rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-rms-gold text-xs font-bold tracking-wider uppercase mb-2 border border-white/10">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Thực Đơn Tinh Hoa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Khám phá ẩm thực nhà hàng
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1.5 leading-relaxed">
            Các món ăn được chế biến từ nguyên liệu tươi ngon chọn lọc mỗi ngày. Chọn món để xem chi tiết dinh dưỡng và thành phần.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input & Availability Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm món theo tên (ví dụ: bò sốt vang, salad...)"
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold text-gray-900 placeholder:text-gray-400 transition-colors"
              aria-label="Tìm kiếm món ăn"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Xóa nội dung tìm kiếm"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded border-gray-300 text-rms-burgundy focus:ring-rms-burgundy/30 cursor-pointer h-4 w-4"
              />
              <span>Chỉ hiển thị món còn phục vụ</span>
            </label>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-rms-burgundy font-semibold hover:underline cursor-pointer ml-1"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Tabs) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryId === null
                  ? "bg-rms-burgundy text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tất cả món ({dishes?.length ?? 0})
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rms-burgundy text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content with AsyncStateView */}
      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingMessage="Đang nạp danh sách món ăn..."
      >
        <DishGrid
          dishes={dishes ?? []}
          categories={categories}
          onSelectDish={(dish) => setSelectedDishId(dish.id)}
        />
      </AsyncStateView>

      {/* Detail Modal */}
      <DishDetailModal
        dishId={selectedDishId}
        categories={categories}
        isOpen={selectedDishId !== null}
        onClose={() => setSelectedDishId(null)}
      />
    </div>
  );
}
