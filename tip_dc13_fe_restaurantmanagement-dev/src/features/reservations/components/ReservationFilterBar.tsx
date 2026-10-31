"use client";

import React, { useMemo } from "react";
import {
  CalendarDaysIcon,
  TableCellsIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Select, type SelectOption } from "@/components/ui/Select";
import {
  RESERVATION_STATUS_FILTER_OPTIONS,
  RESERVATION_SORT_OPTIONS,
  type ReservationSortOptionValue,
} from "../constants/reservation.constants";
import type { ReservationStatus } from "@/types/reservation";
import type { RestaurantTable } from "@/types/table";

export interface ReservationFilterBarProps {
  reservationDate: string;
  status: ReservationStatus | "ALL";
  selectedTableId: number | null;
  sortOption: ReservationSortOptionValue;
  tables: RestaurantTable[];
  isTablesLoading?: boolean;
  isFiltered: boolean;
  onReservationDateChange: (date: string) => void;
  onStatusChange: (status: ReservationStatus | "ALL") => void;
  onTableChange: (tableId: number | null) => void;
  onSortChange: (sort: ReservationSortOptionValue) => void;
  onResetFilter: () => void;
}

export function ReservationFilterBar({
  reservationDate,
  status,
  selectedTableId,
  sortOption,
  tables,
  isTablesLoading = false,
  isFiltered,
  onReservationDateChange,
  onStatusChange,
  onTableChange,
  onSortChange,
  onResetFilter,
}: ReservationFilterBarProps) {
  // Build table options sorted by table number
  const tableOptions = useMemo<SelectOption<number | null>[]>(() => {
    const list: SelectOption<number | null>[] = [
      { value: null, label: "Tất cả bàn ăn" },
    ];

    const sortedTables = [...tables].sort((a, b) =>
      a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true })
    );

    sortedTables.forEach((t) => {
      list.push({
        value: t.id,
        label: `Bàn ${t.tableNumber}${t.roomName ? ` (${t.roomName})` : ""}`,
      });
    });

    return list;
  }, [tables]);

  const sortOptions = useMemo<SelectOption<ReservationSortOptionValue>[]>(() => {
    return RESERVATION_SORT_OPTIONS.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }, []);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center flex-1">
        {/* Date Filter */}
        <div className="relative w-full sm:w-52 md:w-56 shrink-0">
          <CalendarDaysIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={reservationDate}
            onChange={(e) => onReservationDateChange(e.target.value)}
            className="w-full h-11 pl-9 pr-3.5 py-2 text-sm bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-gold focus:ring-2 focus:ring-rms-gold/20 rounded-xl transition-all outline-hidden text-gray-900 cursor-pointer"
            aria-label="Lọc theo ngày đặt bàn"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-52 md:w-56 shrink-0 h-11 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 rounded-xl transition-all flex items-center">
          <Select
            options={RESERVATION_STATUS_FILTER_OPTIONS}
            value={status}
            onChange={(val) => onStatusChange(val)}
            icon={<CheckCircleIcon className="w-4 h-4 text-gray-400" />}
            placeholder="Tất cả trạng thái"
            className="h-full w-full text-sm"
          />
        </div>

        {/* Table Filter */}
        <div className="relative w-full sm:w-60 md:w-64 shrink-0 h-11 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 rounded-xl transition-all flex items-center">
          <Select
            options={tableOptions}
            value={selectedTableId}
            onChange={(val) => onTableChange(val)}
            disabled={isTablesLoading}
            icon={<TableCellsIcon className="w-4 h-4 text-gray-400" />}
            placeholder="Tất cả bàn ăn"
            className="h-full w-full text-sm"
          />
        </div>

        {/* Sort Filter */}
        <div className="relative w-full sm:w-56 md:w-60 shrink-0 h-11 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 rounded-xl transition-all flex items-center">
          <Select
            options={sortOptions}
            value={sortOption}
            onChange={(val) => onSortChange(val)}
            icon={<ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />}
            placeholder="Sắp xếp"
            className="h-full w-full text-sm"
          />
        </div>
      </div>

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onResetFilter}
          className="h-11 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  );
}

export default ReservationFilterBar;
