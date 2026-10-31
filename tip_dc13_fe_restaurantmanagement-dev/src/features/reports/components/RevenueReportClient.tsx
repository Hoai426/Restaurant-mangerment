"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { RevenueFilterBar } from "./RevenueFilterBar";
import { RevenueKpiCards } from "./RevenueKpiCards";
import { RevenueCharts } from "./RevenueCharts";
import { RevenueTable } from "./RevenueTable";
import { useRevenueReport } from "../hooks/useRevenueReport";
import { getPresetDateRange } from "../constants/report.constants";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { ReportDatePreset, ReportGroupBy } from "@/types/report";
import {
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

type RevenueReportView = "chart" | "table";

export function RevenueReportClient() {
  // Chỉ tài khoản ADMIN được phép truy cập
  useRequireAuth(["ADMIN"]);

  // Mặc định ban đầu: 7 ngày qua, nhóm theo Ngày
  const initialPreset: ReportDatePreset = "LAST_7_DAYS";
  const initialRange = getPresetDateRange(initialPreset);

  const [startDate, setStartDate] = useState<string>(initialRange.startDate);
  const [endDate, setEndDate] = useState<string>(initialRange.endDate);
  const [activePreset, setActivePreset] = useState<ReportDatePreset | null>(initialPreset);
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("DAY");
  const [reportView, setReportView] = useState<RevenueReportView>("chart");

  // Gọi API thông qua TanStack Query hook
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRevenueReport({
    startDate,
    endDate,
    groupBy,
  });

  const handleDateChange = (start: string, end: string, preset: ReportDatePreset | null) => {
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset);
  };

  const handleGroupByChange = (newGroupBy: ReportGroupBy) => {
    setGroupBy(newGroupBy);
  };

  const summary = isError ? undefined : data?.summary;
  const timeline = isError ? [] : data?.timeline ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
      {/* Header trang Báo cáo */}
      <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
              <ChartBarIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Báo cáo doanh thu
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi doanh thu thực thu, đơn hàng hoàn tất và đối soát cơ cấu thanh toán theo thời gian
          </p>
        </div>
      </div>

      {/* Thanh bộ lọc thời gian & Thao tác */}
      <div className="shrink-0">
        <RevenueFilterBar
          startDate={startDate}
          endDate={endDate}
          groupBy={groupBy}
          activePreset={activePreset}
          onDateChange={handleDateChange}
          onGroupByChange={handleGroupByChange}
          onRefresh={() => refetch()}
          isFetching={isFetching}
          summary={summary}
          timeline={timeline}
        />
      </div>

      {isFetching && !isLoading && !isError && (
        <div role="status" aria-live="polite" className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
          <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-amber-600" />
          <span>Đang cập nhật số liệu...</span>
        </div>
      )}

      {/* Thông báo lỗi khi gọi API */}
      {isError && (
        <div className="flex shrink-0 animate-fade-in items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
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
            disabled={isFetching}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700 shadow-2xs transition-colors hover:bg-red-100/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2"
          >
            <ArrowPathIcon aria-hidden="true" className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {!isError && (
        <>
          {/* KPI và báo cáo chỉ hiển thị khi có dữ liệu hợp lệ cho bộ lọc hiện tại. */}
          <div className="shrink-0">
            <RevenueKpiCards summary={summary} isLoading={isLoading} />
          </div>

          <section
            className={`min-h-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs ${
              reportView === "table" ? "flex flex-1 flex-col" : "shrink-0"
            }`}
            aria-labelledby="revenue-report-view-title"
          >
        <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100/80">
          <div>
            <h2
              id="revenue-report-view-title"
              className="text-base font-bold text-gray-900 tracking-tight"
            >
              {reportView === "chart"
                ? "Xu hướng Doanh thu & Số lượng đơn hàng"
                : "Bảng đối soát doanh thu chi tiết"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {reportView === "chart"
                ? "Biểu đồ kết hợp đường diện tích doanh thu và cột số lượng đơn hoàn tất"
                : "Dữ liệu thống kê doanh số và phân bổ phương thức thanh toán theo từng mốc thời gian"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setReportView((currentView) =>
                currentView === "chart" ? "table" : "chart"
              )
            }
            aria-controls="revenue-report-view-content"
            aria-pressed={reportView === "table"}
            className="inline-flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:border-rms-burgundy/30 hover:bg-rms-burgundy/5 hover:text-rms-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy focus-visible:ring-offset-2 transition-colors"
          >
            {reportView === "chart" ? (
              <>
                <TableCellsIcon className="w-4 h-4" aria-hidden="true" />
                <span>Xem doanh thu chi tiết</span>
              </>
            ) : (
              <>
                <ChartBarIcon className="w-4 h-4" aria-hidden="true" />
                <span>Xem biểu đồ</span>
              </>
            )}
          </button>
        </div>

        <div id="revenue-report-view-content" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {reportView === "chart" ? (
            <RevenueCharts
              timeline={timeline}
              groupBy={groupBy}
              isLoading={isLoading}
            />
          ) : (
            <RevenueTable
              timeline={timeline}
              summary={summary}
              groupBy={groupBy}
              isLoading={isLoading}
            />
          )}
        </div>
          </section>
        </>
      )}
    </div>
  );
}

export default RevenueReportClient;
