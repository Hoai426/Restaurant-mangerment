"use client";

import React from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { ArrowPathIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { getPresetDateRange, PRESET_OPTIONS } from "../constants/report.constants";
import type { PaymentStatisticsData, ReportDatePreset } from "@/types/report";
import { ExportPaymentStatisticsExcelButton } from "./ExportPaymentStatisticsExcelButton";

interface PaymentStatisticsFilterBarProps {
  startDate: string;
  endDate: string;
  activePreset: ReportDatePreset | null;
  isInvalidRange: boolean;
  isFetching: boolean;
  isError: boolean;
  data?: PaymentStatisticsData;
  onDateChange: (start: string, end: string, preset: ReportDatePreset | null) => void;
  onRefresh: () => void;
}

export function PaymentStatisticsFilterBar({
  startDate,
  endDate,
  activePreset,
  isInvalidRange,
  isFetching,
  isError,
  data,
  onDateChange,
  onRefresh,
}: PaymentStatisticsFilterBarProps) {
  const handlePresetClick = (preset: ReportDatePreset) => {
    const range = getPresetDateRange(preset);
    onDateChange(range.startDate, range.endDate, preset);
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xs sm:p-4" aria-label="Lọc thời gian thống kê thanh toán">
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto]">
        <div role="group" aria-label="Khoảng thời gian nhanh" className="flex min-w-0 flex-wrap items-center gap-1.5 md:col-span-2 xl:col-span-1">
          <span className="mr-1 text-xs font-semibold text-gray-500">Khoảng nhanh:</span>
          {PRESET_OPTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handlePresetClick(item.key)}
              aria-pressed={activePreset === item.key}
              className={`flex h-8 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
                activePreset === item.key
                  ? "border-rms-burgundy/30 bg-rms-burgundy/10 text-rms-burgundy shadow-2xs"
                  : "border-gray-200/80 bg-gray-50/80 text-gray-700 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2 xl:contents">
          <div>
            <label htmlFor="payment-statistics-start-date" className="mb-1 block text-[11px] font-semibold text-gray-600">Từ ngày</label>
            <div className="relative">
              <DatePicker
                id="payment-statistics-start-date"
                clearable
                value={startDate}
                max={endDate || undefined}
                onChange={(value) => onDateChange(value, endDate, null)}
                className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-9 pr-3 text-xs text-gray-800 outline-hidden transition-all hover:bg-gray-50 focus:border-rms-burgundy focus:bg-white focus:ring-2 focus:ring-rms-burgundy/15"
              />
            </div>
          </div>
          <div>
            <label htmlFor="payment-statistics-end-date" className="mb-1 block text-[11px] font-semibold text-gray-600">Đến ngày</label>
            <div className="relative">
              <DatePicker
                id="payment-statistics-end-date"
                clearable
                value={endDate}
                min={startDate || undefined}
                onChange={(value) => onDateChange(startDate, value, null)}
                className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-9 pr-3 text-xs text-gray-800 outline-hidden transition-all hover:bg-gray-50 focus:border-rms-burgundy focus:bg-white focus:ring-2 focus:ring-rms-burgundy/15"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-self-end gap-2 md:col-span-2 xl:col-span-1">
          <ExportPaymentStatisticsExcelButton
            data={data}
            startDate={startDate}
            endDate={endDate}
            disabled={isFetching || isInvalidRange || isError || !data}
          />
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching || isInvalidRange}
            aria-label="Làm mới thống kê thanh toán"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2"
          >
            <ArrowPathIcon aria-hidden="true" className={`h-4 w-4 ${isFetching ? "animate-spin text-rms-burgundy" : ""}`} />
          </button>
        </div>
      </div>

      {isInvalidRange && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <ExclamationCircleIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-red-600" />
          <span>Ngày bắt đầu không được sau ngày kết thúc. Vui lòng chọn lại khoảng ngày.</span>
        </div>
      )}
    </section>
  );
}

export default PaymentStatisticsFilterBar;
