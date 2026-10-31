"use client";

import React from "react";
import { useTables } from "@/features/tables/hooks/useTables";
import { DatePicker } from "@/components/ui/DatePicker";
import type { OrderFilterState, OrderStatus } from "@/types/order";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export interface OrderFilterBarProps {
  filters: OrderFilterState;
  onFilterChange: (newFilters: Partial<OrderFilterState>) => void;
  onReset: () => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý (PENDING)" },
  { value: "CONFIRMED", label: "Đã xác nhận (CONFIRMED)" },
  { value: "COMPLETED", label: "Hoàn tất (COMPLETED)" },
  { value: "CANCELLED", label: "Đã hủy (CANCELLED)" },
];

export function OrderFilterBar({
  filters,
  onFilterChange,
  onReset,
  disabled = false,
}: OrderFilterBarProps) {
  const { data: tables = [], isLoading: isLoadingTables } = useTables();

  const isFiltered = Boolean(
    filters.orderCode.trim() ||
    filters.status !== "ALL" ||
    filters.tableId !== null ||
    filters.createdAt.trim()
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <span>Tìm kiếm & Bộ lọc đơn hàng</span>
          {isFiltered && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rms-burgundy/10 text-rms-burgundy">
              Đang lọc
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            disabled={disabled}
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-rms-burgundy transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Filter 1: Mã đơn hàng (orderCode) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            disabled={disabled}
            value={filters.orderCode}
            onChange={(e) => onFilterChange({ orderCode: e.target.value })}
            placeholder="Tìm theo mã đơn (ORD-...)"
            className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold transition-colors text-xs text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
          />
          {filters.orderCode && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onFilterChange({ orderCode: "" })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Xóa mã đơn"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter 2: Trạng thái (status) */}
        <div>
          <select
            disabled={disabled}
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as OrderStatus | "ALL" })
            }
            className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold transition-colors text-xs text-gray-900 cursor-pointer disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Bàn ăn (table.id) */}
        <div>
          <select
            disabled={disabled || isLoadingTables}
            value={filters.tableId ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              onFilterChange({ tableId: val });
            }}
            className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold transition-colors text-xs text-gray-900 cursor-pointer disabled:opacity-50"
          >
            <option value="">Tất cả bàn ăn</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Bàn #{t.tableNumber} {t.roomName ? `(${t.roomName})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 4: Ngày tạo (createdAt) */}
        <div>
          <DatePicker
            id="order-filter-created-at"
            disabled={disabled}
            value={filters.createdAt}
            onChange={(value) => onFilterChange({ createdAt: value })}
            className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold transition-colors text-xs text-gray-900 cursor-pointer disabled:opacity-50"
            aria-label="Lọc theo ngày tạo đơn"
            clearable
          />
        </div>
      </div>
    </div>
  );
}

export default OrderFilterBar;
