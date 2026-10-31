"use client";

import React, { useMemo } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { Select, type SelectOption } from "@/components/ui/Select";
import {
  TABLE_STATUS_FILTER_OPTIONS,
  CAPACITY_FILTER_OPTIONS,
} from "../constants/table.constants";
import type { TableFilterBarProps } from "@/types/table";

export function TableFilterBar({
  rooms,
  isRoomsLoading,
  searchTerm,
  capacityFilter,
  selectedRoomId,
  selectedStatus,
  onSearchChange,
  onCapacityChange,
  onSelectRoomId,
  onSelectStatus,
  onResetFilter,
  isFiltered,
}: TableFilterBarProps) {
  const roomOptions = useMemo<SelectOption<number | null>[]>(() => {
    const list: SelectOption<number | null>[] = [
      { value: null, label: "Tất cả phòng" },
    ];
    rooms.forEach((r) => {
      list.push({ value: r.id, label: r.name });
    });
    return list;
  }, [rooms]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center flex-1">
        {/* Search Table Number */}
        <div className="relative w-full sm:w-56 md:w-60 shrink-0">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo số bàn..."
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-gold focus:ring-2 focus:ring-rms-gold/20 rounded-xl transition-all outline-hidden text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Filter Capacity */}
        <div className="w-full sm:w-52 relative shrink-0">
          <Select
            options={CAPACITY_FILTER_OPTIONS}
            value={capacityFilter}
            onChange={(val) => onCapacityChange(val)}
            icon={<UserGroupIcon className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Filter Room */}
        <div className="w-full sm:w-44 relative shrink-0">
          <Select
            options={roomOptions}
            value={selectedRoomId}
            onChange={(val) => onSelectRoomId(val)}
            disabled={isRoomsLoading}
            icon={<BuildingOffice2Icon className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Filter Status */}
        <div className="w-full sm:w-40 relative shrink-0">
          <Select
            options={TABLE_STATUS_FILTER_OPTIONS}
            value={selectedStatus}
            onChange={(val) => onSelectStatus(val)}
          />
        </div>
      </div>

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onResetFilter}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  );
}

export default TableFilterBar;
