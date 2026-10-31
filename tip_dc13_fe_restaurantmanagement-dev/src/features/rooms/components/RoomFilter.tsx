"use client";

import React from "react";
import type { RoomFilterProps } from "@/types/room";
import { Select } from "@/components/ui/Select";
import {
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function RoomFilter({
  categories,
  selectedCategoryId,
  searchQuery,
  isCategoriesLoading = false,
  isCategoriesError = false,
  onCategoryChange,
  onSearchChange,
  onReset,
}: RoomFilterProps) {
  const categoryOptions = [
    { value: null as number | null, label: "Tất cả loại phòng" },
    ...categories.map((c) => ({
      value: c.id as number | null,
      label: c.name,
    })),
  ];

  const isFiltered =
    Boolean(searchQuery.trim()) || selectedCategoryId !== null;

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
          placeholder="Tìm phòng theo tên..."
          aria-label="Tìm phòng theo tên"
          className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rms-gold focus:ring-2 focus:ring-rms-gold/20 transition-all text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Category Select */}
      <div className="relative w-full sm:w-60 shrink-0 h-11">
        <Select<number | null>
          id="room-category-filter"
          options={categoryOptions}
          value={selectedCategoryId}
          onChange={onCategoryChange}
          placeholder={
            isCategoriesLoading ? "Đang tải loại phòng..." : "Chọn loại phòng"
          }
          disabled={isCategoriesLoading}
          icon={<BuildingOffice2Icon className="w-5 h-5" strokeWidth={1.8} />}
        />
        {isCategoriesError && (
          <p className="text-[11px] text-amber-600 mt-1 pl-1">
            Không tải được danh sách loại phòng
          </p>
        )}
      </div>

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 h-11 px-4 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Xóa bộ lọc"
          aria-label="Xóa bộ lọc tìm kiếm"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
}

export default RoomFilter;
