"use client";

import { useMemo, useState } from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import type { ReportDatePreset, TopSellingDishesRequest } from "@/types/report";
import { formatCurrency } from "@/utils/format";
import { DatePicker } from "@/components/ui/DatePicker";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { getPresetDateRange, PRESET_OPTIONS } from "../constants/report.constants";
import { useTopSellingDishes } from "../hooks/useTopSellingDishes";
import { TopSellingLimitSelect } from "./TopSellingLimitSelect";
import { ExportTopSellingDishesExcelButton } from "./ExportDishSalesExcelButton";

interface TopSellingDishesSectionProps {
  embedded?: boolean;
}

function formatReportDate(date: string): string {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function buildRequest(
  limit: number,
  preset: ReportDatePreset | null,
  startDate: string,
  endDate: string,
): TopSellingDishesRequest {
  if (preset) return { limit, preset };
  if (startDate && endDate) return { limit, startDate, endDate };
  return { limit };
}

export function TopSellingDishesSection({ embedded = false }: TopSellingDishesSectionProps) {
  const [limit, setLimit] = useState(5);
  const [activePreset, setActivePreset] = useState<ReportDatePreset | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const hasPartialRange = Boolean(startDate) !== Boolean(endDate);
  const isInvalidRange = Boolean(startDate && endDate && startDate > endDate);
  const canQuery = !hasPartialRange && !isInvalidRange;
  const request = useMemo(
    () => buildRequest(limit, activePreset, startDate, endDate),
    [limit, activePreset, startDate, endDate],
  );
  const query = useTopSellingDishes(request, canQuery);
  const reportData = canQuery ? query.data : undefined;

  const handlePresetChange = (preset: ReportDatePreset) => {
    setActivePreset(preset);
    setStartDate("");
    setEndDate("");
  };

  const handleStartDateChange = (value: string) => {
    setActivePreset(null);
    setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setActivePreset(null);
    setEndDate(value);
  };

  const handleAllTime = () => {
    setActivePreset(null);
    setStartDate("");
    setEndDate("");
  };

  const isLoading = canQuery && (query.isLoading || query.isFetching);
  const isError = canQuery && query.isError;
  const presetRange = activePreset ? getPresetDateRange(activePreset) : null;
  const responseRange = reportData
    ? reportData.startDate && reportData.endDate
      ? `${formatReportDate(reportData.startDate)} – ${formatReportDate(reportData.endDate)}`
      : reportData.startDate === null && reportData.endDate === null
        ? "Mọi thời gian"
        : ""
    : hasPartialRange
      ? "Chọn đủ hai ngày"
      : isInvalidRange
        ? "Khoảng ngày không hợp lệ"
        : presetRange
          ? `${formatReportDate(presetRange.startDate)} – ${formatReportDate(presetRange.endDate)}`
          : startDate && endDate
            ? `${formatReportDate(startDate)} – ${formatReportDate(endDate)}`
            : "Mọi thời gian";

  return (
    <section
      className="relative"
      aria-labelledby={!embedded ? "top-selling-title" : undefined}
      aria-label={embedded ? "Top món ăn bán chạy" : undefined}
    >
      {!embedded && (
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 id="top-selling-title" className="text-base font-bold text-gray-900">Top món ăn bán chạy</h2>
            <p className="text-xs text-gray-500">Xếp hạng theo số lượng bán · {responseRange}</p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <label htmlFor="top-selling-limit" className="whitespace-nowrap text-xs text-gray-500">Hiển thị:</label>
            <TopSellingLimitSelect value={limit} onChange={setLimit} />
          </div>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-end">
        <div role="group" aria-label="Lọc nhanh theo thời gian" className="flex min-w-0 flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleAllTime}
            aria-pressed={!activePreset && !startDate && !endDate}
            className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
              !activePreset && !startDate && !endDate
                ? "border-rms-burgundy/30 bg-rms-burgundy/10 text-rms-burgundy"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Mọi thời gian
          </button>
          {PRESET_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handlePresetChange(option.key)}
              aria-pressed={activePreset === option.key}
              className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
                activePreset === option.key
                  ? "border-rms-burgundy/30 bg-rms-burgundy/10 text-rms-burgundy"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
          {embedded && (
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <div className="flex items-center gap-1.5">
                <label htmlFor="top-selling-limit" className="whitespace-nowrap text-xs text-gray-500">Hiển thị:</label>
                <TopSellingLimitSelect value={limit} onChange={setLimit} />
              </div>
              <ExportTopSellingDishesExcelButton
                items={reportData?.items ?? []}
                startDate={reportData?.startDate ?? null}
                endDate={reportData?.endDate ?? null}
                limit={limit}
                disabled={query.isFetching || isError || !reportData || !canQuery}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="top-selling-start-date" className="mb-1 block text-[11px] font-semibold text-gray-600">Từ ngày</label>
            <DatePicker
                id="top-selling-start-date"
                clearable
                value={startDate}
                max={endDate || undefined}
                onChange={handleStartDateChange}
                className="h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50/70 pl-9 pr-2 text-xs text-gray-800 outline-hidden focus:border-rms-burgundy focus:bg-white focus:ring-2 focus:ring-rms-burgundy/15"
            />
          </div>
          <div>
            <label htmlFor="top-selling-end-date" className="mb-1 block text-[11px] font-semibold text-gray-600">Đến ngày</label>
              <DatePicker
                id="top-selling-end-date"
                clearable
                value={endDate}
                min={startDate || undefined}
                onChange={handleEndDateChange}
                className="h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50/70 pl-9 pr-2 text-xs text-gray-800 outline-hidden focus:border-rms-burgundy focus:bg-white focus:ring-2 focus:ring-rms-burgundy/15"
              />
          </div>
        </div>

        {hasPartialRange && (
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 lg:col-span-2">
            Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc để lọc báo cáo.
          </p>
        )}
        {isInvalidRange && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 lg:col-span-2">
            Ngày bắt đầu không được sau ngày kết thúc. Vui lòng chọn lại khoảng ngày.
          </p>
        )}
      </div>

      <div className="overflow-hidden">
        {isError && (
          <div role="alert" className="flex items-start justify-between gap-3 border-b border-gray-100 bg-red-50 p-4 text-xs text-red-700">
            <div className="flex items-start gap-2.5">
              <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <strong className="block font-bold">{getApiErrorMessage(query.error).title}:</strong>
                <span>{getApiErrorMessage(query.error).message}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700 transition-colors hover:bg-red-100/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2"
            >
              <ArrowPathIcon aria-hidden="true" className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        <div className="overflow-x-auto" aria-busy={isLoading}>
          {isLoading && <p role="status" className="sr-only">Đang tải danh sách món bán chạy.</p>}
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-12 sm:w-[8%]" />
              <col className="w-auto sm:w-[44%]" />
              <col className="w-[28%] sm:w-[20%]" />
              <col className="hidden sm:table-column sm:w-[28%]" />
            </colgroup>
            <thead className="border-b border-gray-100 bg-gray-50/80 text-[10px] font-semibold uppercase tracking-wider text-gray-600 sm:text-xs">
              <tr>
                <th scope="col" className="px-2 py-3 text-center sm:px-4">Hạng</th>
                <th scope="col" className="px-2 py-3 sm:px-4">Món ăn</th>
                <th scope="col" className="px-2 py-3 text-right sm:px-4">Đã bán</th>
                <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr key={`top-selling-skeleton-${index}`} className="animate-pulse">
                  <td className="px-2 py-4 sm:px-4"><div className="mx-auto h-5 w-5 rounded-full bg-gray-200" /></td>
                  <td className="px-2 py-4 sm:px-4"><div className="h-4 w-3/4 rounded bg-gray-200" /></td>
                  <td className="px-2 py-4 sm:px-4"><div className="ml-auto h-4 w-10 rounded bg-gray-200" /></td>
                  <td className="hidden px-4 py-4 sm:table-cell"><div className="ml-auto h-4 w-24 rounded bg-gray-200" /></td>
                </tr>
              ))}

              {!isLoading && !isError && reportData?.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-9 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
                        <InboxIcon aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">Chưa có dữ liệu món bán chạy</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && reportData?.items.map((item) => (
                <tr key={item.dishId} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-2 py-3.5 text-center sm:px-4">
                    <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-bold tabular-nums ${item.rank <= 3 ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="break-words px-2 py-3.5 font-semibold text-gray-900 sm:px-4">
                    {item.dishName}
                    <span className="mt-0.5 block text-[11px] font-medium text-rms-burgundy sm:hidden">{formatCurrency(item.revenue)}</span>
                  </td>
                  <td className="px-2 py-3.5 text-right font-semibold tabular-nums text-gray-800 sm:px-4">
                    {item.quantitySold.toLocaleString("vi-VN")}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-rms-burgundy sm:table-cell">
                    {formatCurrency(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TopSellingDishesSection;
