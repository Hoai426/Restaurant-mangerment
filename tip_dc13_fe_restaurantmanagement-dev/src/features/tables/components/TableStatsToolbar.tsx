"use client";

import React from "react";
import type { TableStatus } from "@/types/table";

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
}

export interface TableStatsToolbarProps {
  stats: TableStats;
  selectedStatus: TableStatus | "ALL";
  onSelectStatus: (status: TableStatus | "ALL") => void;
}

/**
 * @deprecated Merged into `TableFilterBar` status dropdown (RM-202). No longer presented as KPI tiles.
 */
export function TableStatsToolbar({
  stats,
  selectedStatus,
  onSelectStatus,
}: TableStatsToolbarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button
        type="button"
        onClick={() => onSelectStatus("ALL")}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "ALL"
            ? "bg-white border-rms-burgundy shadow-sm ring-1 ring-rms-burgundy"
            : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-2xs"
        }`}
      >
        <div className="text-xs font-medium text-gray-500 mb-1">Tổng số bàn</div>
        <div className="text-2xl font-bold text-rms-charcoal">{stats.total}</div>
      </button>

      <button
        type="button"
        onClick={() => onSelectStatus("AVAILABLE")}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "AVAILABLE"
            ? "bg-emerald-50/60 border-emerald-600 shadow-sm ring-1 ring-emerald-600"
            : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-emerald-700">Bàn trống</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="text-2xl font-bold text-emerald-800">{stats.available}</div>
      </button>

      <button
        type="button"
        onClick={() => onSelectStatus("OCCUPIED")}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "OCCUPIED"
            ? "bg-amber-50/60 border-amber-600 shadow-sm ring-1 ring-amber-600"
            : "bg-white border-gray-100 hover:border-amber-200 hover:shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-amber-700">Đang phục vụ</span>
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        </div>
        <div className="text-2xl font-bold text-amber-800">{stats.occupied}</div>
      </button>

      <button
        type="button"
        onClick={() => onSelectStatus("RESERVED")}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "RESERVED"
            ? "bg-blue-50/60 border-blue-600 shadow-sm ring-1 ring-blue-600"
            : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-blue-700">Đã đặt trước</span>
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        </div>
        <div className="text-2xl font-bold text-blue-800">{stats.reserved}</div>
      </button>
    </div>
  );
}

export default TableStatsToolbar;
