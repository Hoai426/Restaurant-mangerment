"use client";

import React, { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import {
  formatTimelinePeriod,
  formatTimelinePeriodDetailed,
} from "../constants/report.constants";
import type { RevenueTimelinePoint, ReportGroupBy } from "@/types/report";
import {
  BanknotesIcon,
  CreditCardIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

export interface RevenueChartsProps {
  timeline: RevenueTimelinePoint[];
  groupBy: ReportGroupBy;
  isLoading?: boolean;
}

// Custom Tooltip hiển thị ngắn gọn, dễ đọc, không chiếm nhiều diện tích
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    dataKey?: string;
    payload?: RevenueTimelinePoint;
  }>;
  label?: string;
  groupBy: ReportGroupBy;
}

function CustomReportTooltip({ active, payload, groupBy }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const detailedPeriod = formatTimelinePeriodDetailed(data.period, groupBy);

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-lg border border-gray-100 p-3 text-xs space-y-2 min-w-[210px] pointer-events-none z-50">
      {/* Tiêu đề mốc thời gian */}
      <div className="border-b border-gray-100 pb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-900">{detailedPeriod.primary}</span>
          {detailedPeriod.secondary && (
            <span className="text-[11px] font-medium text-gray-500">
              ({detailedPeriod.secondary})
            </span>
          )}
        </div>
        {groupBy !== "DAY" && (
          <span className="text-[10px] text-gray-400 tabular-nums">{data.period}</span>
        )}
      </div>

      {/* Doanh thu & Số đơn */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Doanh thu:</span>
          <span className="font-bold text-rms-burgundy tabular-nums">
            {formatCurrency(data.revenue)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <ShoppingBagIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Số đơn hàng:</span>
          </div>
          <span className="font-bold text-amber-700 tabular-nums">
            {data.orderCount} đơn
          </span>
        </div>
      </div>

      {/* Cơ cấu phương thức chi tiết */}
      <div className="pt-1.5 border-t border-gray-100 space-y-1 text-[11px]">
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <BanknotesIcon className="w-3 h-3 text-emerald-600" />
            <span>Tiền mặt:</span>
          </div>
          <span className="font-medium text-gray-800 tabular-nums">
            {formatCurrency(data.cashAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <CreditCardIcon className="w-3 h-3 text-blue-600" />
            <span>Thẻ POS:</span>
          </div>
          <span className="font-medium text-gray-800 tabular-nums">
            {formatCurrency(data.cardAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <QrCodeIcon className="w-3 h-3 text-purple-600" />
            <span>Chuyển khoản QR:</span>
          </div>
          <span className="font-medium text-gray-800 tabular-nums">
            {formatCurrency(data.qrAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

const emptySubscribe = () => () => {};

export function RevenueCharts({
  timeline = [],
  groupBy,
  isLoading = false,
}: RevenueChartsProps) {
  // Tránh lỗi hydration mismatch của Recharts trong Next.js App Router (chuẩn React 19)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Chiều cao chart giảm 20-25% so với trước (h-[260px] sm:h-[280px])
  if (isLoading || !isMounted) {
    return (
      <div className="h-[240px] p-3 sm:h-[260px] sm:p-4 xl:h-[230px] 2xl:h-[210px] flex flex-col justify-center items-center gap-3">
        <div className="w-full h-full bg-gray-50/70 rounded-xl animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-400 font-medium">
            Đang nạp dữ liệu biểu đồ...
          </span>
        </div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="p-3 sm:p-4 text-center flex flex-col items-center justify-center h-[240px] sm:h-[260px] xl:h-[230px] 2xl:h-[210px] text-gray-400">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 mb-2">
          <InboxIcon className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-gray-600">
          Không có dữ liệu biểu đồ
        </p>
        <p className="text-xs text-gray-400 mt-0.5 max-w-sm">
          Chưa ghi nhận giao dịch thanh toán thành công nào trong khoảng thời gian này.
        </p>
      </div>
    );
  }

  // Format số tiền gọn cho trục Y trái (ví dụ: 1.5 tr, 500 k)
  const formatYAxisCurrency = (val: number) => {
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)} tr`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toFixed(0)} k`;
    }
    return val.toString();
  };

  const showStaticDots = timeline.length <= 14;

  return (
    <div className="px-2 sm:px-4 pb-3 sm:pb-4">
      {/* Chiều cao giảm 20-25%: h-[250px] sm:h-[280px] */}
      <div className="w-full h-[220px] sm:h-[240px] xl:h-[210px] 2xl:h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={timeline}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7A1F2B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7A1F2B" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

            {/* Trục hoành X: mốc thời gian */}
            <XAxis
              dataKey="period"
              tickFormatter={(period) => formatTimelinePeriod(period, groupBy)}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              dy={6}
            />

            {/* Trục tung trái Y1: Doanh thu */}
            <YAxis
              yAxisId="left"
              tickFormatter={formatYAxisCurrency}
              tick={{ fontSize: 11, fill: "#7A1F2B", fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={54}
            />

            {/* Trục tung phải Y2: Số đơn hàng */}
            <YAxis
              yAxisId="right"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#C89B3C", fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              width={34}
            />

            <Tooltip
              content={<CustomReportTooltip groupBy={groupBy} />}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 8, fontSize: 12 }}
            />

            {/* Cột Số đơn hàng (BarChart) */}
            <Bar
              yAxisId="right"
              dataKey="orderCount"
              name="Số đơn hàng"
              fill="#C89B3C"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              opacity={0.82}
            />

            {/* Vùng diện tích Doanh thu (AreaChart) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Doanh thu (VNĐ)"
              stroke="#7A1F2B"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={
                showStaticDots
                  ? { r: 3, stroke: "#7A1F2B", strokeWidth: 1.5, fill: "#FFFFFF" }
                  : false
              }
              activeDot={{
                r: 5.5,
                stroke: "#7A1F2B",
                strokeWidth: 2,
                fill: "#FFFFFF",
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueCharts;
