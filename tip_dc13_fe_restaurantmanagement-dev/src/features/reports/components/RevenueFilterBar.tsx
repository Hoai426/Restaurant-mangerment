"use client";

import React from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  PRESET_OPTIONS,
  GROUP_BY_OPTIONS,
  getPresetDateRange,
} from "../constants/report.constants";
import type { ReportDatePreset, ReportGroupBy } from "@/types/report";
import { ExportExcelButton } from "./ExportExcelButton";
import type { RevenueSummary, RevenueTimelinePoint } from "@/types/report";

export interface RevenueFilterBarProps {
  startDate: string;
  endDate: string;
  groupBy: ReportGroupBy;
  activePreset: ReportDatePreset | null;
  onDateChange: (start: string, end: string, preset: ReportDatePreset | null) => void;
  onGroupByChange: (groupBy: ReportGroupBy) => void;
  onRefresh?: () => void;
  isFetching?: boolean;
  summary?: RevenueSummary;
  timeline?: RevenueTimelinePoint[];
}

export function RevenueFilterBar({
  startDate,
  endDate,
  groupBy,
  activePreset,
  onDateChange,
  onGroupByChange,
  onRefresh,
  isFetching = false,
  summary,
  timeline,
}: RevenueFilterBarProps) {
  const isInvalidRange = Boolean(startDate && endDate && startDate > endDate);

  const handlePresetClick = (preset: ReportDatePreset) => {
    const range = getPresetDateRange(preset);
    onDateChange(range.startDate, range.endDate, preset);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-3.5 shadow-xs space-y-3">
      {/* Hàng 1: Quick filter presets & Thao tác (Refresh + Xuất Excel) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Nhóm Quick Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="hidden shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500 mr-1 sm:inline">
            Khoảng nhanh:
          </span>
          {PRESET_OPTIONS.map((item) => {
            const isActive = activePreset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handlePresetClick(item.key)}
                className={`h-9 shrink-0 whitespace-nowrap px-3.5 text-xs font-semibold rounded-xl transition-all cursor-pointer border flex items-center justify-center ${
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

        {/* Nút Làm mới & Xuất Excel (Cùng chiều cao h-9) */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="h-9 w-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Làm mới dữ liệu báo cáo"
              aria-label="Làm mới dữ liệu"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isFetching ? "animate-spin text-rms-burgundy" : ""}`} />
            </button>
          )}

          <ExportExcelButton
            summary={summary}
            timeline={timeline}
            startDate={startDate}
            endDate={endDate}
            groupBy={groupBy}
            disabled={isInvalidRange}
          />
        </div>
      </div>

      {/* Hàng 2: Bộ chọn khoảng ngày (Từ ngày -> Đến ngày) và GroupBy */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-gray-100 items-end">
        {/* Bộ chọn Ngày: Từ ngày -> Đến ngày (Bỏ dấu * bắt buộc theo yêu cầu) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label
              htmlFor="report-start-date"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Từ ngày
            </label>
            <div className="relative">
              <DatePicker
                id="report-start-date"
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
              htmlFor="report-end-date"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Đến ngày
            </label>
            <div className="relative">
              <DatePicker
                id="report-end-date"
                clearable
                value={endDate}
                onChange={(value) => onDateChange(startDate, value, null)}
                min={startDate || undefined}
                className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-burgundy focus:ring-2 focus:ring-rms-burgundy/15 rounded-xl transition-all outline-hidden text-gray-800 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Chế độ xem: GroupBy (Ngày, Tuần, Tháng) */}
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Mốc thời gian</span>
          </label>
          <div className="h-9 p-0.5 bg-gray-100/90 rounded-xl border border-gray-200/60 grid grid-cols-3 gap-0.5 items-center">
            {GROUP_BY_OPTIONS.map((item) => {
              const isSelected = groupBy === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onGroupByChange(item.value)}
                  className={`h-full flex items-center justify-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-rms-burgundy shadow-2xs font-bold border border-gray-200/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thông báo lỗi validation nếu khoảng ngày không hợp lệ */}
      {isInvalidRange && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-fade-in md:col-span-12">
          <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Khoảng ngày không hợp lệ:</strong> Ngày bắt đầu ({startDate}) không được lớn hơn ngày kết thúc ({endDate}). Vui lòng chọn lại.
          </span>
        </div>
      )}
    </div>
  );
}

export default RevenueFilterBar;
