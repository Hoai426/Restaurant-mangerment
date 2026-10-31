"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import {
  STATUS_COLORS,
  formatOrderStatusLabel,
  formatOrderValueRangeLabel,
} from "../constants/order-report.constants";
import type {
  OrderValueRangeStatItem,
  OrderStatusStatItem,
  OrderStatisticsSummary,
} from "@/types/report";
import {
  ChartBarIcon,
  ChartPieIcon,
  InboxIcon,
  TagIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { OrderStatsStatusTable } from "./OrderStatsStatusTable";
import { OrderStatsValueTable } from "./OrderStatsValueTable";

type OrderStatsPanelView = "chart" | "table";

export interface OrderStatsChartsProps {
  byValueRange?: OrderValueRangeStatItem[];
  byStatus?: OrderStatusStatItem[];
  summary?: OrderStatisticsSummary;
  totalOrders?: number;
  isLoading?: boolean;
  valueRangeView?: OrderStatsPanelView;
  statusView?: OrderStatsPanelView;
  onValueRangeViewChange?: () => void;
  onStatusViewChange?: () => void;
}

const emptySubscribe = () => () => {};
const emptyViewChange = () => {};

// Custom Tooltip cho Biểu đồ phân khúc giá trị
interface ValueTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      name: string;
      orderCount: number;
      totalValue: number;
      pct: string;
    };
  }>;
}

function ValueRangeTooltip({ active, payload }: ValueTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-lg border border-gray-100 p-3 text-xs space-y-1.5 min-w-[200px] pointer-events-none z-50">
      <div className="border-b border-gray-100 pb-1.5 flex items-center gap-1.5 font-bold text-gray-900">
        <TagIcon className="w-3.5 h-3.5 text-rms-burgundy shrink-0" />
        <span>{data.name}</span>
      </div>
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-gray-600">
          <span>Số đơn hàng:</span>
          <span className="font-bold text-gray-900 tabular-nums">
            {data.orderCount.toLocaleString("vi-VN")} đơn ({data.pct}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Tổng giá trị:</span>
          <span className="font-bold text-rms-burgundy tabular-nums">
            {formatCurrency(data.totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip cho Biểu đồ cơ cấu trạng thái
interface StatusTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      status: string;
      label: string;
      orderCount: number;
      totalValue: number;
      pct: string;
      color: string;
    };
  }>;
}

function StatusTooltip({ active, payload }: StatusTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-lg border border-gray-100 p-3 text-xs space-y-1.5 min-w-[190px] pointer-events-none z-50">
      <div className="border-b border-gray-100 pb-1.5 flex items-center gap-2 font-bold text-gray-900">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: data.color }}
        />
        <span>{data.label}</span>
      </div>
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-gray-600">
          <span>Số lượng đơn:</span>
          <span className="font-bold text-gray-900 tabular-nums">
            {data.orderCount.toLocaleString("vi-VN")} đơn ({data.pct}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Tổng giá trị:</span>
          <span className="font-bold text-gray-900 tabular-nums">
            {formatCurrency(data.totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function OrderStatsCharts({
  byValueRange = [],
  byStatus = [],
  summary,
  totalOrders = 0,
  isLoading = false,
  valueRangeView = "chart",
  statusView = "chart",
  onValueRangeViewChange = emptyViewChange,
  onStatusViewChange = emptyViewChange,
}: OrderStatsChartsProps) {
  const [isStatusSliceHovered, setIsStatusSliceHovered] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Chuẩn bị dữ liệu cho Biểu đồ phân khúc giá trị
  const valueChartData = byValueRange.map((item) => {
    const pct =
      totalOrders > 0
        ? ((item.orderCount / totalOrders) * 100).toFixed(1)
        : "0.0";
    let shortName = item.range;
    if (item.range === "0-200000") shortName = "< 200k";
    else if (item.range === "200000-500000") shortName = "200k - 500k";
    else if (item.range === "500000-1000000") shortName = "500k - 1M";
    else if (item.range === "1000000+") shortName = "> 1M";

    return {
      range: item.range,
      shortName,
      name: formatOrderValueRangeLabel(item.range),
      orderCount: item.orderCount,
      totalValue: item.totalValue,
      pct,
    };
  });

  // Chuẩn bị dữ liệu cho Biểu đồ cơ cấu trạng thái
  const statusChartData = byStatus.map((item) => {
    const pct =
      totalOrders > 0
        ? ((item.orderCount / totalOrders) * 100).toFixed(1)
        : "0.0";
    return {
      status: item.status,
      label: formatOrderStatusLabel(item.status),
      orderCount: item.orderCount,
      totalValue: item.totalValue,
      pct,
      color: STATUS_COLORS[item.status],
    };
  });

  const hasValueData = totalOrders > 0;
  const hasStatusData = byStatus.length > 0;
  const isChartReady = !isLoading && isMounted;
  const hasTableView = valueRangeView === "table" || statusView === "table";

  return (
    <div
      className={`grid grid-cols-1 gap-3 lg:grid-cols-12 2xl:gap-2.5 ${
        hasTableView ? "lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]" : ""
      }`}
    >
      {/* Biểu đồ 1: Phân khúc giá trị đơn hàng (BarChart) */}
      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs lg:col-span-7 lg:flex lg:min-h-0 lg:flex-col"
        aria-labelledby="order-value-report-title"
      >
        <div className="shrink-0 p-3 sm:p-4 2xl:p-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 border-b border-gray-100/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
              {valueRangeView === "chart" ? (
                <ChartBarIcon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <TableCellsIcon className="w-4 h-4" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2
                id="order-value-report-title"
                className="text-sm font-bold text-gray-900 tracking-tight"
              >
                {valueRangeView === "chart"
                  ? "Phân bổ theo khoảng giá trị"
                  : "Thống kê đơn hàng theo Khoảng giá trị"}
              </h2>
              <p className="text-[11px] text-gray-500">
                {valueRangeView === "chart"
                  ? "Số lượng đơn hàng phân theo 4 phân khúc giá trị (Tooltip xem chi tiết doanh số)"
                  : "Chi tiết 4 phân khúc giá trị cố định và doanh số ghi nhận từng phân khúc"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start xl:self-auto">
            {valueRangeView === "table" && !isLoading && (
              <span className="text-xs text-gray-500 font-medium tabular-nums whitespace-nowrap">
                <strong className="text-gray-900">{byValueRange.length}</strong> phân khúc
              </span>
            )}
            <button
              type="button"
              onClick={onValueRangeViewChange}
              aria-controls="order-value-report-content"
              aria-pressed={valueRangeView === "table"}
              className="inline-flex items-center justify-center gap-2 shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:border-rms-burgundy/30 hover:bg-rms-burgundy/5 hover:text-rms-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy focus-visible:ring-offset-2 transition-colors"
            >
              {valueRangeView === "chart" ? (
                <>
                  <TableCellsIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Xem bảng chi tiết</span>
                </>
              ) : (
                <>
                  <ChartBarIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Xem biểu đồ</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div id="order-value-report-content" className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
          {valueRangeView === "table" ? (
            <OrderStatsValueTable
              byValueRange={byValueRange}
              summary={summary}
              isLoading={isLoading}
            />
          ) : !isChartReady ? (
            <div className="p-3 sm:p-4 h-[190px] 2xl:h-[150px] flex items-center justify-center">
              <div className="w-full h-full bg-gray-50/70 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">
                  Đang nạp dữ liệu phân khúc giá trị...
                </span>
              </div>
            </div>
          ) : !hasValueData ? (
            <div className="h-[190px] 2xl:h-[150px] flex flex-col items-center justify-center text-gray-500">
              <InboxIcon className="w-8 h-8 text-gray-300 mb-1" />
              <p className="text-xs font-semibold text-gray-600">Không có dữ liệu phân khúc</p>
              <p className="text-xs text-gray-500">Không có đơn hàng nào trong khoảng thời gian lọc</p>
            </div>
          ) : (
            <div className="h-[190px] 2xl:h-[150px] w-full px-2 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={valueChartData}
                  margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="shortName"
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <Tooltip content={<ValueRangeTooltip />} />
                  <Bar
                    dataKey="orderCount"
                    name="Số đơn hàng"
                    fill="#7A1F2B"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {valueRangeView === "chart" && isChartReady && (
            <div className="mx-3 sm:mx-4 mb-2 2xl:mb-1 pt-1.5 2xl:pt-1 border-t border-gray-50 flex items-center justify-between text-[11px] 2xl:text-[10px] text-gray-500">
              <span>* Trục Y thể hiện số lượng đơn hàng</span>
              <span>4 phân khúc chuẩn định</span>
            </div>
          )}
        </div>
      </section>

      {/* Biểu đồ 2: Cơ cấu trạng thái đơn hàng (Donut Chart) */}
      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs lg:col-span-5 lg:flex lg:min-h-0 lg:flex-col"
        aria-labelledby="order-status-report-title"
      >
        <div className="shrink-0 p-3 sm:p-4 2xl:p-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 border-b border-gray-100/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              {statusView === "chart" ? (
                <ChartPieIcon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <TableCellsIcon className="w-4 h-4" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2
                id="order-status-report-title"
                className="text-sm font-bold text-gray-900 tracking-tight"
              >
                {statusView === "chart"
                  ? "Cơ cấu trạng thái đơn hàng"
                  : "Thống kê đơn hàng theo Trạng thái"}
              </h2>
              <p className="text-[11px] text-gray-500">
                {statusView === "chart"
                  ? "Tỷ trọng các trạng thái đơn hàng"
                  : "Phân bổ số lượng và tổng giá trị theo trạng thái đơn hàng"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start xl:self-auto">
            {statusView === "table" && !isLoading && (
              <span className="text-xs text-gray-500 font-medium tabular-nums whitespace-nowrap">
                <strong className="text-gray-900">{byStatus.length}</strong> trạng thái
              </span>
            )}
            <button
              type="button"
              onClick={onStatusViewChange}
              aria-controls="order-status-report-content"
              aria-pressed={statusView === "table"}
              className="inline-flex items-center justify-center gap-2 shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:border-rms-burgundy/30 hover:bg-rms-burgundy/5 hover:text-rms-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy focus-visible:ring-offset-2 transition-colors"
            >
              {statusView === "chart" ? (
                <>
                  <TableCellsIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Xem bảng chi tiết</span>
                </>
              ) : (
                <>
                  <ChartPieIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Xem biểu đồ</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div id="order-status-report-content" className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
          {statusView === "table" ? (
            <OrderStatsStatusTable
              byStatus={byStatus}
              summary={summary}
              isLoading={isLoading}
            />
          ) : !isChartReady ? (
            <div className="p-3 sm:p-4 h-[190px] 2xl:h-[150px] flex items-center justify-center">
              <div className="w-full h-full bg-gray-50/70 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">
                  Đang nạp dữ liệu cơ cấu trạng thái...
                </span>
              </div>
            </div>
          ) : !hasStatusData ? (
            <div className="h-[190px] 2xl:h-[150px] flex flex-col items-center justify-center text-gray-500">
              <InboxIcon className="w-8 h-8 text-gray-300 mb-1" />
              <p className="text-xs font-semibold text-gray-600">Không có dữ liệu trạng thái</p>
              <p className="text-xs text-gray-500">Không có đơn hàng nào trong khoảng thời gian lọc</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 min-h-[190px] 2xl:min-h-[150px] px-3 sm:px-4 py-3 2xl:py-2">
            {/* Donut Chart */}
            <div className="w-[140px] h-[140px] 2xl:w-[124px] 2xl:h-[124px] shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<StatusTooltip />} />
                  <Pie
                    data={statusChartData}
                    dataKey="orderCount"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={55}
                    paddingAngle={3}
                    onMouseEnter={() => setIsStatusSliceHovered(true)}
                    onMouseLeave={() => setIsStatusSliceHovered(false)}
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={`cell-${entry.status}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center info */}
              <div
                aria-hidden={isStatusSliceHovered}
                className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-150 ${
                  isStatusSliceHovered ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="text-xs font-semibold text-gray-600">Tổng</span>
                <span className="text-sm font-bold text-gray-900 tabular-nums">
                  {totalOrders}
                </span>
              </div>
            </div>

            {/* Chi tiết từng trạng thái */}
            <div className="space-y-1.5 2xl:space-y-1 flex-1 w-full text-xs">
              {statusChartData.map((item) => (
                <div
                  key={item.status}
                  className="p-1.5 2xl:px-1.5 2xl:py-1 rounded-lg bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 2xl:gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="2xl:flex 2xl:items-center 2xl:gap-1.5 min-w-0">
                      <span className="font-semibold text-gray-800 block 2xl:whitespace-nowrap">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-600 tabular-nums 2xl:whitespace-nowrap">
                        {formatCurrency(item.totalValue)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right 2xl:flex 2xl:items-center 2xl:gap-2 shrink-0">
                    <span className="font-bold text-gray-900 tabular-nums block 2xl:whitespace-nowrap">
                      {item.orderCount} đơn
                    </span>
                    <span className="text-xs font-semibold text-gray-600 tabular-nums 2xl:whitespace-nowrap">
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {statusView === "chart" && isChartReady && (
            <div className="mx-3 sm:mx-4 mb-2 2xl:mb-1 pt-1.5 2xl:pt-1 border-t border-gray-50 flex items-center justify-between text-[11px] 2xl:text-[10px] text-gray-500">
              <span>Dữ liệu: các trạng thái API trả về</span>
              <span className="tabular-nums">Tổng {totalOrders} đơn</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default OrderStatsCharts;
