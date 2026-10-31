"use client";

import React from "react";
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  PRESET_OPTIONS,
  getPresetDateRange,
} from "../constants/report.constants";
import {
  ORDER_STATUS_OPTIONS,
  formatOrderStatusLabelLower,
  type OrderStatusFilterKey,
} from "../constants/order-report.constants";
import { ExportOrderExcelButton } from "./ExportOrderExcelButton";
import type { ReportDatePreset, OrderStatisticsData } from "@/types/report";

export interface OrderStatsFilterBarProps {
  startDate: string;
  endDate: string;
  statusFilter: OrderStatusFilterKey;
  activePreset: ReportDatePreset | null;
  onDateChange: (start: string, end: string, preset: ReportDatePreset | null) => void;
  onStatusChange: (status: OrderStatusFilterKey) => void;
  onRefresh?: () => void;
  isFetching?: boolean;
  data?: OrderStatisticsData;
}

export function OrderStatsFilterBar({
  startDate,
  endDate,
  statusFilter,
  activePreset,
  onDateChange,
  onStatusChange,
  onRefresh,
  isFetching = false,
  data,
}: OrderStatsFilterBarProps) {
  const isInvalidRange = Boolean(startDate && endDate && startDate > endDate);
  const reportScopeDescription =
    statusFilter === "ALL"
      ? "Báo cáo gồm cả 4 trạng thái đơn hàng."
      : `Báo cáo chỉ tính đơn ${formatOrderStatusLabelLower(statusFilter)}.`;

  const handlePresetClick = (preset: ReportDatePreset) => {
    const range = getPresetDateRange(preset);
    onDateChange(range.startDate, range.endDate, preset);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-3.5 shadow-xs space-y-3">
      {/* Hàng 1: Quick filter presets & Thao tác (Refresh + Xuất Excel) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Nhóm Quick Filters */}
        <div role="group" aria-label="Khoảng thời gian nhanh" className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 mr-1 hidden shrink-0 whitespace-nowrap sm:inline">
            Khoảng nhanh:
          </span>
          {PRESET_OPTIONS.map((item) => {
            const isActive = activePreset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handlePresetClick(item.key)}
                aria-pressed={isActive}
                className={`h-9 shrink-0 whitespace-nowrap px-3.5 text-xs font-semibold rounded-xl transition-all cursor-pointer border flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-rms-burgundy/10 text-rms-burgundy border-rms-burgundy/30 shadow-2xs"
                    : "bg-gray-50/80 hover:bg-gray-100 text-gray-700 border-gray-200/80 hover:border-gray-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Nút Làm mới & Xuất Excel */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="h-9 w-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2"
              title="Làm mới dữ liệu thống kê"
              aria-label="Làm mới dữ liệu"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isFetching ? "animate-spin text-rms-burgundy" : ""}`} />
            </button>
          )}

          <ExportOrderExcelButton
            data={data}
            startDate={startDate}
            endDate={endDate}
            statusFilter={statusFilter}
            disabled={isInvalidRange || isFetching}
          />
        </div>
      </div>

      {/* Hàng 2: Chọn Từ ngày -> Đến ngày & Lọc Trạng thái đơn */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-gray-100 items-end">
        {/* Bộ chọn Ngày: Từ ngày -> Đến ngày */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label
              htmlFor="order-stats-start-date"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Từ ngày
            </label>
            <div className="relative">
              <DatePicker
                id="order-stats-start-date"
                clearable
                value={startDate}
                onChange={(value) => onDateChange(value, endDate, null)}
                max={endDate || undefined}
                className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-burgundy focus:ring-2 focus:ring-rms-burgundy/15 rounded-xl transition-all outline-hidden text-gray-800 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="order-stats-end-date"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Đến ngày
            </label>
            <div className="relative">
              <DatePicker
                id="order-stats-end-date"
                clearable
                value={endDate}
                onChange={(value) => onDateChange(startDate, value, null)}
                min={startDate || undefined}
                className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-burgundy focus:ring-2 focus:ring-rms-burgundy/15 rounded-xl transition-all outline-hidden text-gray-800 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Lọc Trạng thái: Tất cả, Chờ xử lý, Đã xác nhận, Hoàn tất, Đã hủy */}
        <div className="md:col-span-5">
          <label htmlFor="order-stats-status" className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <FunnelIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Trạng thái đơn hàng</span>
          </label>
          <div className="relative flex h-9 w-full items-center rounded-xl border border-gray-200 bg-gray-50/70 transition-all hover:bg-gray-50 focus-within:border-rms-burgundy focus-within:bg-white focus-within:ring-2 focus-within:ring-rms-burgundy/15">
            <Select<OrderStatusFilterKey>
              id="order-stats-status"
              options={ORDER_STATUS_OPTIONS.map(({ key, label }) => ({ value: key, label }))}
              value={statusFilter}
              onChange={onStatusChange}
              className="h-full w-full text-xs font-normal text-gray-800"
            />
          </div>
        </div>
        <p className="md:col-span-12 -mt-0.5 text-[11px] text-gray-500 2xl:hidden">{reportScopeDescription}</p>
      </div>

      {/* Thông báo lỗi validation nếu khoảng ngày không hợp lệ */}
      {isInvalidRange && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-fade-in">
          <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Khoảng ngày không hợp lệ:</strong> Ngày bắt đầu ({startDate}) không được lớn hơn ngày kết thúc ({endDate}). Vui lòng chọn lại.
          </span>
        </div>
      )}
    </div>
  );
}

export default OrderStatsFilterBar;
