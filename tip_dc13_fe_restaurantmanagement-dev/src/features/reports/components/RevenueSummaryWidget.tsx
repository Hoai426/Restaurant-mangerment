"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ChartBarIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/format";
import { useDailyRevenueReport } from "../hooks/useDailyRevenueReport";
import type { DailyRevenueReportPoint } from "@/types/report";

const VI_WEEKDAYS_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_WEEKDAYS_FULL = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

const emptySubscribe = () => () => {};

interface MiniTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: DailyRevenueReportPoint;
  }>;
}

function MiniChartTooltip({ active, payload }: MiniTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  // Lấy thứ và ngày
  const parts = point.date.split("-");
  let dayLabel = point.date;
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const fullDay = VI_WEEKDAYS_FULL[d.getDay()] || "";
    dayLabel = `${fullDay}, ${parts[2]}/${parts[1]}`;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-100 p-2.5 text-xs min-w-[170px] pointer-events-none z-50">
      <p className="font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-1.5">
        {dayLabel}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-gray-600">
          <span>Doanh thu:</span>
          <span className="font-bold text-rms-burgundy tabular-nums">
            {formatCurrency(point.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Số đơn:</span>
          <span className="font-semibold text-amber-700 tabular-nums">
            {point.orderCount} đơn
          </span>
        </div>
      </div>
    </div>
  );
}

export function RevenueSummaryWidget() {
  // Tránh lỗi Hydration Mismatch trong Next.js (React 19)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { data, isLoading, isError, refetch, isFetching } = useDailyRevenueReport({
    preset: "LAST_7_DAYS",
    filters: [],
  });

  const dailyPoints = data?.points ?? [];

  const totalRevenue = data?.summary?.totalRevenue ?? 0;
  const totalOrders = data?.summary?.totalOrders ?? 0;
  const hasNoData = dailyPoints.length === 0 || (totalRevenue === 0 && totalOrders === 0);

  // Format số tiền gọn cho trục Y
  const formatYAxisCurrency = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} tr`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)} k`;
    return val.toString();
  };

  // Format nhãn trục X: "T2 (10/10)"
  const formatXAxisTick = (date: string) => {
    const parts = date.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const shortDay = VI_WEEKDAYS_SHORT[d.getDay()] || "";
      return `${shortDay} (${parts[2]}/${parts[1]})`;
    }
    return date;
  };

  // 1. Trạng thái Loading Skeleton
  if (isLoading || !isMounted) {
    return (
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 animate-pulse space-y-2.5">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-44"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* 2 KPI Skeleton */}
        <div className="grid grid-cols-2 gap-4 p-3.5 bg-gray-50/70 rounded-xl">
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-28"></div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="h-[150px] bg-gray-50 rounded-xl flex items-center justify-center">
          <span className="text-xs text-gray-400">Đang tải biểu đồ 7 ngày...</span>
        </div>
      </div>
    );
  }

  // 2. Trạng thái Lỗi (Error State)
  if (isError) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col items-center justify-center min-h-[240px] text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <ExclamationCircleIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">Không thể tải dữ liệu doanh thu</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Đã có lỗi xảy ra khi truy vấn dữ liệu báo cáo 7 ngày qua.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy-dark rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  // 3. Trạng thái Render chính
  return (
    <div className="bg-white rounded-2xl p-3 lg:p-3.5 shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header Widget */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rms-charcoal tracking-tight">
              Doanh thu 7 ngày qua
            </h3>
          </div>
        </div>

        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1 text-xs font-semibold text-rms-burgundy hover:text-rms-burgundy-dark hover:underline transition-colors shrink-0 group"
          title="Chuyển đến trang Báo cáo chi tiết"
        >
          <span>Xem báo cáo</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 2 KPI tóm tắt */}
      <div className="grid grid-cols-2 gap-3 my-2.5 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Doanh thu
          </p>
          <h4 className="text-xl sm:text-2xl font-bold text-rms-burgundy tracking-tight tabular-nums mt-0.5">
            {formatCurrency(totalRevenue)}
          </h4>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Đơn hoàn tất
          </p>
          <h4 className="text-xl sm:text-2xl font-bold text-rms-charcoal tracking-tight tabular-nums mt-0.5">
            {totalOrders.toLocaleString("vi-VN")}{" "}
            <span className="text-xs font-normal text-gray-400">đơn</span>
          </h4>
        </div>
      </div>

      {/* Mini Chart doanh thu 7 ngày */}
      <div className="w-full h-[125px] mt-1">
        {hasNoData ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl">
            <p className="text-xs font-medium text-gray-500">
              Chưa có dữ liệu doanh thu trong 7 ngày qua.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyPoints}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="widgetRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7A1F2B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7A1F2B" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisTick}
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                dy={4}
              />

              <YAxis
                tickFormatter={formatYAxisCurrency}
                tick={{ fontSize: 10, fill: "#7A1F2B", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />

              <Tooltip content={<MiniChartTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#7A1F2B"
                strokeWidth={2}
                fill="url(#widgetRevenueGrad)"
                dot={{
                  r: 3,
                  stroke: "#7A1F2B",
                  strokeWidth: 1.5,
                  fill: "#FFFFFF",
                }}
                activeDot={{
                  r: 5,
                  stroke: "#7A1F2B",
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default RevenueSummaryWidget;
