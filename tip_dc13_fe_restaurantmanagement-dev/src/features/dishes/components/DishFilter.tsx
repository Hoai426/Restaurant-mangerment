"use client";

import React from "react";
import type { Category } from "@/types/category";
import { Select } from "@/components/ui/Select";
import {
  MagnifyingGlassIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface DishFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  searchQuery: string;
  selectedStatus?: boolean | null;
  showStatusFilter?: boolean;
  isCategoriesLoading?: boolean;
  isCategoriesError?: boolean;
  onCategoryChange: (categoryId: number | null) => void;
  onSearchChange: (search: string) => void;
  onStatusChange?: (status: boolean | null) => void;
  onReset: () => void;
}

type StatusValue = "all" | "available" | "unavailable";

export function DishFilter({
  categories,
  selectedCategoryId,
  searchQuery,
  selectedStatus = null,
  showStatusFilter = true,
  isCategoriesLoading = false,
  isCategoriesError = false,
  onCategoryChange,
  onSearchChange,
  onStatusChange,
  onReset,
}: DishFilterProps) {
  const categoryOptions = [
    { value: null as number | null, label: "Tất cả danh mục" },
    ...categories.map((c) => ({
      value: c.id as number | null,
      label: c.name,
    })),
  ];

  const statusOptions = [
    { value: "all" as StatusValue, label: "Tất cả trạng thái" },
    { value: "available" as StatusValue, label: "Còn món" },
    { value: "unavailable" as StatusValue, label: "Tạm hết" },
  ];

  const currentStatusValue: StatusValue =
    selectedStatus === true
      ? "available"
      : selectedStatus === false
      ? "unavailable"
      : "all";

  const handleStatusChange = (val: StatusValue) => {
    if (!onStatusChange) return;
    if (val === "available") onStatusChange(true);
    else if (val === "unavailable") onStatusChange(false);
    else onStatusChange(null);
  };

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    selectedCategoryId !== null ||
    (selectedStatus !== null && selectedStatus !== undefined);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/80 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <MagnifyingGlassIcon className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm món ăn theo tên hoặc mô tả..."
          className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rms-gold focus:ring-2 focus:ring-rms-gold/20 transition-all text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Category Select */}
      <div className="relative w-full sm:w-56 shrink-0 h-11">
        <Select<number | null>
          id="dish-category-filter"
          options={categoryOptions}
          value={selectedCategoryId}
          onChange={onCategoryChange}
          placeholder={isCategoriesLoading ? "Đang tải danh mục..." : "Chọn danh mục"}
          disabled={isCategoriesLoading}
          icon={<TagIcon className="w-5 h-5" strokeWidth={1.8} />}
        />
        {isCategoriesError && (
          <p className="text-[11px] text-amber-600 mt-1 pl-1">
            Không tải được danh mục
          </p>
        )}
      </div>

      {/* Status Select (Optional for Customer, default true for Admin/Staff) */}
      {showStatusFilter && onStatusChange && (
        <div className="relative w-full sm:w-48 shrink-0 h-11">
          <Select<StatusValue>
            id="dish-status-filter"
            options={statusOptions}
            value={currentStatusValue}
            onChange={handleStatusChange}
            placeholder="Chọn trạng thái"
            icon={<CheckCircleIcon className="w-5 h-5" strokeWidth={1.8} />}
          />
        </div>
      )}

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="h-11 px-3.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-dashed border-gray-200 hover:border-red-200 transition-colors shrink-0"
          title="Xóa bộ lọc"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  );
}
export default DishFilter;
