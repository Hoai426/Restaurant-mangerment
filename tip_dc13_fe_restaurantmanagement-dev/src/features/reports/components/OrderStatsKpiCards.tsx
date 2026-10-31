"use client";

import React from "react";
import {
  ShoppingBagIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/format";
import {
  STATUS_COLORS,
  formatOrderStatusLabelLower,
  formatOrderValueRangeLabel,
  type OrderStatusFilterKey,
} from "../constants/order-report.constants";
import type { OrderStatus } from "@/types/order";
import type {
  OrderStatisticsSummary,
  OrderStatusStatItem,
  OrderValueRangeStatItem,
} from "@/types/report";

export interface OrderStatsKpiCardsProps {
  summary?: OrderStatisticsSummary;
  byStatus?: OrderStatusStatItem[];
  byValueRange?: OrderValueRangeStatItem[];
  statusFilter?: OrderStatusFilterKey;
  isLoading?: boolean;
}

const STATUS_ICONS: Record<OrderStatus, typeof ClockIcon> = {
  PENDING: ClockIcon,
  CONFIRMED: CheckCircleIcon,
  COMPLETED: CheckCircleIcon,
  CANCELLED: XCircleIcon,
};

export function OrderStatsKpiCards({
  summary,
  byStatus = [],
  byValueRange = [],
  statusFilter = "ALL",
  isLoading = false,
}: OrderStatsKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`order-kpi-skeleton-${i}`}
            className="bg-white rounded-2xl p-3 2xl:p-2.5 border border-gray-100 shadow-xs animate-pulse flex flex-col justify-between min-h-[124px] 2xl:min-h-[104px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-36 mt-1.5"></div>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0"></div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100/80">
              <div className="h-4 bg-gray-100 rounded w-32"></div>
              {i === 1 && <div className="h-8 bg-gray-100 rounded w-full"></div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalOrders = summary?.totalOrders ?? 0;
  const totalValue = summary?.totalValue ?? 0;
  const completedOrders =
    byStatus.find((item) => item.status === "COMPLETED")?.orderCount ?? 0;
  const selectedStatus = statusFilter === "ALL" ? null : statusFilter;
  const selectedStatusCount = selectedStatus
    ? byStatus.find((item) => item.status === selectedStatus)?.orderCount ?? 0
    : 0;

  // Tính giá trị trung bình mỗi đơn (AOV)
  const aov = totalOrders > 0 ? Math.round(totalValue / totalOrders) : 0;

  // Tính tỷ lệ hoàn tất trên tổng cả bốn trạng thái
  const completionRate =
    totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : "0.0";

  const statusMetricLabel = selectedStatus
    ? `Đơn ${formatOrderStatusLabelLower(selectedStatus)}`
    : "Tỷ lệ hoàn tất";
  const statusMetricFooter = selectedStatus
    ? `Số đơn ${formatOrderStatusLabelLower(selectedStatus)} trong khoảng đã chọn`
    : null;
  const statusAccent = selectedStatus ? STATUS_COLORS[selectedStatus] : null;
  const StatusIcon = selectedStatus ? STATUS_ICONS[selectedStatus] : CheckCircleIcon;
  const valueScopeNote = selectedStatus
    ? `Chỉ tính đơn ${formatOrderStatusLabelLower(selectedStatus)} trong phạm vi lọc.`
    : "Bao gồm cả đơn đang chờ xử lý và đã xác nhận; không phải doanh thu đã thu.";

  // Xác định phân khúc giá trị chủ đạo (khoảng giá có nhiều đơn nhất)
  const topRange =
    byValueRange && byValueRange.length > 0
      ? [...byValueRange].sort((a, b) => b.orderCount - a.orderCount)[0]
      : null;

  const topRangeCount = topRange?.orderCount ?? 0;
  const topRangePct =
    totalOrders > 0 && topRangeCount > 0
      ? ((topRangeCount / totalOrders) * 100).toFixed(0)
      : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 2xl:gap-2.5">
      {/* Card 1: Tổng đơn hàng */}
      <div className="bg-white rounded-2xl p-3 2xl:p-2.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] 2xl:min-h-[104px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tổng đơn hàng
            </p>
            <h3 className="text-2xl 2xl:text-xl font-bold text-gray-900 tracking-tight tabular-nums mt-1">
              {totalOrders.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal text-gray-400">đơn</span>
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
            <ShoppingBagIcon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] leading-4 text-gray-500 mt-2 pt-1.5 border-t border-gray-100/80">
          Tổng số đơn trong phạm vi lọc
        </p>
      </div>

      {/* Card 2: Tổng giá trị đơn hàng */}
      <div className="bg-white rounded-2xl p-3 2xl:p-2.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] 2xl:min-h-[104px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tổng giá trị đơn
            </p>
            <h3 className="text-2xl 2xl:text-xl font-bold text-rms-burgundy tracking-tight tabular-nums mt-1">
              {formatCurrency(totalValue)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <BanknotesIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-gray-100/80">
          <p className="text-[11px] leading-4 text-gray-500">
            Giá trị TB: <span className="font-semibold text-gray-600 tabular-nums">{formatCurrency(aov)}</span> / đơn
          </p>
          <p className="text-[11px] leading-4 text-gray-500">
            {valueScopeNote}
          </p>
        </div>
      </div>

      {/* Card 3: Tỷ lệ hoàn tất hoặc số đơn theo trạng thái đang lọc */}
      <div className="bg-white rounded-2xl p-3 2xl:p-2.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] 2xl:min-h-[104px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {statusMetricLabel}
              </p>
            </div>
            <h3
              className={`text-2xl 2xl:text-xl font-bold tracking-tight tabular-nums mt-1 ${
                selectedStatus ? "" : "text-emerald-600"
              }`}
              style={statusAccent ? { color: statusAccent } : undefined}
            >
              {selectedStatus ? (
                <>
                  {selectedStatusCount.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs font-normal text-gray-500">đơn</span>
                </>
              ) : (
                <>{completionRate}%</>
              )}
            </h3>
          </div>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              selectedStatus ? "" : "bg-emerald-50 text-emerald-600"
            }`}
            style={
              statusAccent
                ? { color: statusAccent, backgroundColor: `${statusAccent}14` }
                : undefined
            }
          >
            <StatusIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-[11px] leading-4 text-gray-500 mt-2 pt-1.5 border-t border-gray-100/80">
          {statusMetricFooter ? (
            <span>{statusMetricFooter}</span>
          ) : (
            <span>
              Trong kết quả lọc:{" "}
              <strong className="text-gray-700 tabular-nums">
                {completedOrders}/{totalOrders}
              </strong>{" "}
              đơn
            </span>
          )}
        </div>
      </div>

      {/* Card 4: Phân khúc đơn chủ đạo */}
      <div className="bg-white rounded-2xl p-3 2xl:p-2.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] 2xl:min-h-[104px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Phân khúc chủ đạo
            </p>
            <h3 className="text-lg 2xl:text-base font-bold text-gray-900 tracking-tight mt-1 line-clamp-1">
              {topRange && topRangeCount > 0
                ? formatOrderValueRangeLabel(topRange.range)
                : "Chưa có"}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TagIcon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] leading-4 text-gray-500 mt-2 pt-1.5 border-t border-gray-100/80">
          {topRange && topRangeCount > 0 ? (
            <span>
              Chiếm{" "}
              <strong className="text-gray-700 tabular-nums">
                {topRangeCount} đơn ({topRangePct}%)
              </strong>
            </span>
          ) : (
            "Chưa ghi nhận phân khúc"
          )}
        </p>
      </div>
    </div>
  );
}

export default OrderStatsKpiCards;
