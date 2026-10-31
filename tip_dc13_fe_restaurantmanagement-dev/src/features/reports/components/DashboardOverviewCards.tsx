"use client";

import { useMemo, useState } from "react";
import {
  ArrowPathIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { DatePicker } from "@/components/ui/DatePicker";
import { useOverviewStatistics } from "../hooks/useOverviewStatistics";
import { buildOverviewStatisticsFilters } from "../constants/overview-report.constants";
import { PRESET_OPTIONS, getPresetDateRange } from "../constants/report.constants";
import { formatCurrency } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { ReportDatePreset } from "@/types/report";

const KPI_CARDS = [
  {
    key: "revenue",
    title: "Doanh thu",
    icon: BanknotesIcon,
    iconClassName: "bg-rms-burgundy/10 text-rms-burgundy",
  },
  {
    key: "orders",
    title: "Tổng đơn hàng",
    icon: ShoppingBagIcon,
    iconClassName: "bg-amber-50 text-amber-700",
  },
  {
    key: "reservations",
    title: "Tổng lượt đặt bàn",
    icon: UserGroupIcon,
    iconClassName: "bg-blue-50 text-blue-700",
  },
] as const;

export function DashboardOverviewCards() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState<ReportDatePreset | null>(null);
  const isInvalidRange = Boolean(startDate && endDate && startDate > endDate);

  const filters = useMemo(
    () => buildOverviewStatisticsFilters(startDate, endDate),
    [startDate, endDate]
  );
  const request = useMemo(() => ({ filters }), [filters]);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useOverviewStatistics(request, { enabled: !isInvalidRange });

  const handleDateChange = (start: string, end: string, preset: ReportDatePreset | null) => {
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset);
  };

  const handlePresetClick = (preset: ReportDatePreset) => {
    const range = getPresetDateRange(preset);
    handleDateChange(range.startDate, range.endDate, preset);
  };

  const isReportLoading = isLoading || isFetching;

  return (
    <section className="mb-3 space-y-2" aria-label="Thống kê tổng quan">
      {isFetching && !isLoading && !isError && !isInvalidRange && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rms-burgundy" role="status">
          <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
          Đang cập nhật số liệu
        </span>
      )}
      <div className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-xs sm:p-3">
        <div className="grid grid-cols-1 items-end gap-2 lg:grid-cols-[minmax(0,1.45fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_auto]">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Khoảng thời gian nhanh">
            <span className="mr-1 text-[11px] font-semibold text-gray-500">Khoảng:</span>
            {PRESET_OPTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handlePresetClick(item.key)}
                aria-pressed={activePreset === item.key}
                className={`flex h-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
                  activePreset === item.key
                    ? "border-rms-burgundy/30 bg-rms-burgundy/10 text-rms-burgundy"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleDateChange("", "", null)}
              aria-pressed={!startDate && !endDate}
              className={`flex h-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
                !startDate && !endDate
                  ? "border-rms-burgundy/30 bg-rms-burgundy/10 text-rms-burgundy"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Toàn thời gian
            </button>
          </div>

          <div>
                <label htmlFor="dashboard-overview-start-date" className="mb-1 block text-[10px] font-semibold text-gray-600">
                  Từ ngày
                </label>
                <div className="relative">
                  <DatePicker
                    id="dashboard-overview-start-date"
                    clearable
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(value) => handleDateChange(value, endDate, null)}
                    className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-9 pr-2 text-xs text-gray-800 outline-hidden transition-colors focus:border-rms-burgundy focus:bg-white focus:ring-2 focus:ring-rms-burgundy/15"
                  />
                </div>
          </div>
          <div>
                <label htmlFor="dashboard-overview-end-date" className="mb-1 block text-[10px] font-semibold text-gray-600">
                  Đến ngày
                </label>
                <div className="relative">
                  <DatePicker
                    id="dashboard-overview-end-date"
                    clearable
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(value) => handleDateChange(startDate, value, null)}
                    className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-9 pr-2 text-xs text-gray-800 outline-hidden transition-colors focus:border-rms-burgundy focus:bg-white focus:ring-2 focus:ring-rms-burgundy/15"
                  />
                </div>
          </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching || isInvalidRange}
              aria-label="Làm mới số liệu tổng quan"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center self-end rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2"
            >
              <ArrowPathIcon aria-hidden="true" className={`h-4 w-4 ${isFetching ? "animate-spin text-rms-burgundy" : ""}`} />
            </button>
        </div>
      </div>

      {isInvalidRange && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Ngày bắt đầu không được sau ngày kết thúc. Vui lòng điều chỉnh khoảng ngày để xem số liệu.
        </p>
      )}

      {isError && !isInvalidRange && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <strong className="block font-bold">{getApiErrorMessage(error).title}</strong>
              <span>{getApiErrorMessage(error).message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 self-start rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2 sm:self-auto"
          >
            <ArrowPathIcon aria-hidden="true" className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Thử lại
          </button>
        </div>
      )}

      {!isInvalidRange && !isError && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            const value =
              card.key === "revenue"
                ? formatCurrency(data?.totalRevenue ?? 0)
                : (card.key === "orders" ? data?.totalOrders : data?.totalReservations)?.toLocaleString("vi-VN") ?? "0";

            return (
              <article
                key={card.key}
                className="flex min-h-[84px] items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-xs sm:p-3.5"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{card.title}</p>
                    {isReportLoading || !data ? (
                      <div className="mt-3 h-7 w-36 animate-pulse rounded bg-gray-200" aria-label="Đang tải số liệu" />
                    ) : (
                      <p className="mt-1.5 break-words text-2xl font-bold tracking-tight text-rms-charcoal tabular-nums">
                        {value}
                      </p>
                    )}
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default DashboardOverviewCards;
