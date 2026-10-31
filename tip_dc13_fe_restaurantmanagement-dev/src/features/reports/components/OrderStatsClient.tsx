"use client";

import React, { useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { OrderStatsFilterBar } from "./OrderStatsFilterBar";
import { OrderStatsKpiCards } from "./OrderStatsKpiCards";
import { OrderStatsCharts } from "./OrderStatsCharts";
import { useOrderStatistics } from "../hooks/useOrderStatistics";
import { getPresetDateRange } from "../constants/report.constants";
import {
  buildOrderStatisticsFilters,
  type OrderStatusFilterKey,
} from "../constants/order-report.constants";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { ReportDatePreset } from "@/types/report";
import {
  ShoppingBagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

type OrderStatsPanelView = "chart" | "table";

export function OrderStatsClient() {
  // Chỉ tài khoản ADMIN được phép truy cập
  useRequireAuth(["ADMIN"]);

  // Mặc định ban đầu: 7 ngày qua, lọc Tất cả trạng thái
  const initialPreset: ReportDatePreset = "LAST_7_DAYS";
  const initialRange = getPresetDateRange(initialPreset);

  const [startDate, setStartDate] = useState<string>(initialRange.startDate);
  const [endDate, setEndDate] = useState<string>(initialRange.endDate);
  const [activePreset, setActivePreset] = useState<ReportDatePreset | null>(initialPreset);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilterKey>("ALL");
  const [valueRangeView, setValueRangeView] = useState<OrderStatsPanelView>("chart");
  const [statusView, setStatusView] = useState<OrderStatsPanelView>("chart");

  // Xây dựng request payload chuẩn (CHỈ có filters, không gửi thừa startDate/endDate/groupBy)
  const requestPayload = useMemo(
    () => ({
      filters: buildOrderStatisticsFilters(startDate, endDate, statusFilter),
    }),
    [startDate, endDate, statusFilter]
  );

  const isValidRange = Boolean(startDate && endDate && startDate <= endDate);

  // Gọi API thông qua TanStack Query hook
  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = useOrderStatistics(requestPayload, {
    enabled: isValidRange,
  });

  const handleDateChange = (start: string, end: string, preset: ReportDatePreset | null) => {
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset);
  };

  const handleStatusChange = (status: OrderStatusFilterKey) => {
    setStatusFilter(status);
  };

  const reportData = isPlaceholderData ? undefined : data;
  const summary = reportData?.summary;
  const byStatus = reportData?.byStatus ?? [];
  const byValueRange = reportData?.byValueRange ?? [];
  const isReportLoading = isLoading || (isPlaceholderData && isFetching);

  return (
    <div className="space-y-2.5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-2.5 lg:overflow-hidden lg:space-y-0">
      {/* Header trang Thống kê đơn hàng */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
              <ShoppingBagIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Thống kê đơn hàng
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Phân tích số lượng và giá trị đơn hàng theo trạng thái và các phân khúc giá trị
          </p>
        </div>

        {/* Chỉ báo đang làm mới dữ liệu (Refetch indicator chống nhầm số liệu cũ) */}
        {isFetching && !isLoading && (
          <div role="status" aria-live="polite" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold animate-fade-in self-start sm:self-center shadow-2xs">
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Đang cập nhật số liệu mới...</span>
          </div>
        )}
      </div>

      {/* Thanh bộ lọc thời gian, trạng thái & Xuất Excel */}
      <div className="shrink-0">
        <OrderStatsFilterBar
          startDate={startDate}
          endDate={endDate}
          statusFilter={statusFilter}
          activePreset={activePreset}
          onDateChange={handleDateChange}
          onStatusChange={handleStatusChange}
          onRefresh={() => refetch()}
          isFetching={isFetching}
          data={reportData}
        />
      </div>

      {/* Thông báo lỗi khi gọi API */}
      {isError && (
        <div role="alert" className="shrink-0 animate-fade-in flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <div className="flex items-start gap-2.5">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">
                {getApiErrorMessage(error).title}:
              </strong>
              <span>{getApiErrorMessage(error).message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-xl font-semibold shadow-2xs hover:bg-red-100/50 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {isValidRange && (!isError || Boolean(reportData)) && (
        <>
          {/* 4 Thẻ KPI: Tổng đơn, Tổng giá trị, Chỉ số trạng thái, Phân khúc chủ đạo */}
          <div className="shrink-0">
            <OrderStatsKpiCards
              summary={summary}
              byStatus={byStatus}
              byValueRange={byValueRange}
              statusFilter={statusFilter}
              isLoading={isReportLoading}
            />
          </div>

          {/* Biểu đồ và bảng chi tiết dùng chung khung theo từng nhóm báo cáo */}
          <div className="min-h-0 lg:flex-1">
            <OrderStatsCharts
              byValueRange={byValueRange}
              byStatus={byStatus}
              summary={summary}
              totalOrders={summary?.totalOrders ?? 0}
              isLoading={isReportLoading}
              valueRangeView={valueRangeView}
              statusView={statusView}
              onValueRangeViewChange={() =>
                setValueRangeView((view) => (view === "chart" ? "table" : "chart"))
              }
              onStatusViewChange={() =>
                setStatusView((view) => (view === "chart" ? "table" : "chart"))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

export default OrderStatsClient;
