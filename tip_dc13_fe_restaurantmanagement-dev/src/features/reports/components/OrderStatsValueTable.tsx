"use client";

import React from "react";
import { formatCurrency } from "@/utils/format";
import { formatOrderValueRangeLabel } from "../constants/order-report.constants";
import type {
  OrderValueRangeStatItem,
  OrderStatisticsSummary,
} from "@/types/report";
import { InboxIcon, TagIcon } from "@heroicons/react/24/outline";

export interface OrderStatsValueTableProps {
  byValueRange?: OrderValueRangeStatItem[];
  summary?: OrderStatisticsSummary;
  isLoading?: boolean;
}

export function OrderStatsValueTable({
  byValueRange = [],
  summary,
  isLoading = false,
}: OrderStatsValueTableProps) {
  const totalOrders = summary?.totalOrders ?? 0;
  const totalValue = summary?.totalValue ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalValue / totalOrders) : 0;

  return (
    <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col">
      <div
        role="region"
        aria-label="Bảng thống kê phân khúc giá trị đơn hàng, cuộn để xem dữ liệu"
        tabIndex={0}
        className="overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-auto lg:overscroll-contain lg:focus-visible:outline-none lg:focus-visible:ring-2 lg:focus-visible:ring-inset lg:focus-visible:ring-rms-burgundy/40"
      >
        <table className="w-full min-w-[720px] text-left border-collapse text-xs">
          <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-100 font-semibold tracking-wider uppercase text-xs">
            <tr>
              <th scope="col" className="py-2.5 px-3.5 text-left lg:sticky lg:top-0 lg:z-10 lg:bg-gray-50 sm:px-4">Phân khúc giá trị</th>
              <th scope="col" className="py-2.5 px-3.5 text-center lg:sticky lg:top-0 lg:z-10 lg:bg-gray-50 sm:px-4">Số lượng đơn</th>
              <th scope="col" className="py-2.5 px-3.5 text-right lg:sticky lg:top-0 lg:z-10 lg:bg-gray-50 sm:px-4">Tỷ trọng đơn</th>
              <th scope="col" className="py-2.5 px-3.5 text-right lg:sticky lg:top-0 lg:z-10 lg:bg-gray-50 sm:px-4">Giá trị TB / đơn</th>
              <th scope="col" className="py-2.5 px-3.5 text-right lg:sticky lg:top-0 lg:z-10 lg:bg-gray-50 sm:px-4">Tổng giá trị</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-700">
            {/* Loading Skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`val-skeleton-${i}`} className="animate-pulse">
                    <td className="py-3.5 px-3.5 sm:px-4">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-4 text-center">
                      <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-14 ml-auto"></div>
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && byValueRange.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                      <InboxIcon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      Không có dữ liệu phân khúc giá trị
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Không ghi nhận đơn hàng nào trong khoảng thời gian đã chọn.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!isLoading &&
              byValueRange.map((item) => {
                const count = item.orderCount;
                const value = item.totalValue;
                const pct =
                  totalOrders > 0
                    ? ((count / totalOrders) * 100).toFixed(1)
                    : "0.0";
                const aov = count > 0 ? Math.round(value / count) : 0;

                return (
                  <tr
                    key={item.range}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-3.5 sm:px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-3.5 h-3.5 text-rms-burgundy shrink-0" />
                        <span>{formatOrderValueRangeLabel(item.range)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5 sm:px-4 text-center font-medium text-gray-900 tabular-nums">
                      {count.toLocaleString("vi-VN")} đơn
                    </td>

                    <td className="py-3.5 px-3.5 sm:px-4 text-right font-medium text-gray-700 tabular-nums">
                      {pct}%
                    </td>

                    <td className="py-3.5 px-3.5 sm:px-4 text-right font-medium text-gray-700 tabular-nums">
                      {formatCurrency(aov)}
                    </td>

                    <td className="py-3.5 px-3.5 sm:px-4 text-right font-bold text-rms-burgundy tabular-nums">
                      {formatCurrency(value)}
                    </td>
                  </tr>
                );
              })}
          </tbody>

          {/* Hàng Tổng cộng */}
          {!isLoading && byValueRange.length > 0 && (
            <tfoot className="bg-gray-50/90 font-bold border-t border-gray-200 text-gray-900 text-xs">
              <tr>
                <td className="py-3.5 px-3.5 uppercase tracking-wider text-gray-800 lg:sticky lg:bottom-0 lg:z-10 lg:border-t lg:border-gray-200 lg:bg-gray-50 sm:px-4">
                  Tổng cộng
                </td>
                <td className="py-3.5 px-3.5 text-center tabular-nums text-rms-burgundy lg:sticky lg:bottom-0 lg:z-10 lg:border-t lg:border-gray-200 lg:bg-gray-50 sm:px-4">
                  {totalOrders.toLocaleString("vi-VN")} đơn
                </td>
                <td className="py-3.5 px-3.5 text-right tabular-nums lg:sticky lg:bottom-0 lg:z-10 lg:border-t lg:border-gray-200 lg:bg-gray-50 sm:px-4">
                  {totalOrders > 0 ? "100.0%" : "0.0%"}
                </td>
                <td className="py-3.5 px-3.5 text-right tabular-nums text-gray-700 lg:sticky lg:bottom-0 lg:z-10 lg:border-t lg:border-gray-200 lg:bg-gray-50 sm:px-4">
                  {formatCurrency(avgOrderValue)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-sm tabular-nums text-rms-burgundy lg:sticky lg:bottom-0 lg:z-10 lg:border-t lg:border-gray-200 lg:bg-gray-50 sm:px-4">
                  {formatCurrency(totalValue)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default OrderStatsValueTable;
