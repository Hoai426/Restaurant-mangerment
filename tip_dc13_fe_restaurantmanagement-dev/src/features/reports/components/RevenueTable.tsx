"use client";

import React from "react";
import { formatCurrency } from "@/utils/format";
import { formatTimelinePeriodDetailed } from "../constants/report.constants";
import type {
  RevenueTimelinePoint,
  RevenueSummary,
  ReportGroupBy,
} from "@/types/report";
import { InboxIcon } from "@heroicons/react/24/outline";

export interface RevenueTableProps {
  timeline: RevenueTimelinePoint[];
  summary?: RevenueSummary;
  groupBy: ReportGroupBy;
  isLoading?: boolean;
}

export function RevenueTable({
  timeline = [],
  summary,
  groupBy,
  isLoading = false,
}: RevenueTableProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 justify-end border-b border-gray-100/80 px-4 py-3">
        <span className="text-xs text-gray-500 font-medium tabular-nums">
          Tổng cộng: <strong className="text-gray-900">{timeline.length}</strong> mốc
        </span>
      </div>

      <div
        role="region"
        aria-label="Bảng doanh thu chi tiết, cuộn để xem các mốc thời gian"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rms-burgundy/40"
      >
        <table className="w-full min-w-[760px] text-left border-collapse text-xs">
          <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 font-semibold tracking-wider uppercase text-[11px]">
            <tr>
              <th className="sticky top-0 z-10 bg-gray-50 py-2.5 px-3.5 text-left sm:px-4">Mốc thời gian</th>
              <th className="sticky top-0 z-10 bg-gray-50 py-2.5 px-3.5 text-center sm:px-4">Số đơn</th>
              <th className="sticky top-0 z-10 bg-gray-50 py-2.5 px-3.5 text-right sm:px-4">Tiền mặt</th>
              <th className="sticky top-0 z-10 bg-gray-50 py-2.5 px-3.5 text-right sm:px-4">Thẻ ngân hàng (POS)</th>
              <th className="sticky top-0 z-10 bg-gray-50 py-2.5 px-3.5 text-right sm:px-4">Chuyển khoản QR</th>
              <th className="sticky top-0 z-10 bg-gray-50 py-2.5 px-3.5 text-right sm:px-4">Tổng doanh thu</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-700">
            {/* Trạng thái Loading Skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`tbl-skeleton-${i}`} className="animate-pulse">
                    <td className="py-3 px-3.5 sm:px-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="py-3 px-3.5 sm:px-4 text-center">
                      <div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div>
                    </td>
                    <td className="py-3 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                    <td className="py-3 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                    <td className="py-3 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                    <td className="py-3 px-3.5 sm:px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Trạng thái rỗng */}
            {!isLoading && timeline.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                      <InboxIcon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      Không có dữ liệu doanh thu
                    </p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Không có giao dịch thanh toán thành công nào trong khoảng thời gian đã chọn.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Dữ liệu từng mốc thời gian */}
            {!isLoading &&
              timeline.map((item, idx) => {
                const periodDisplay = formatTimelinePeriodDetailed(item.period, groupBy);
                return (
                  <tr
                    key={`point-${item.period}-${idx}`}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Cột 1: Mốc thời gian (căn trái) */}
                    <td className="py-2.5 px-3.5 sm:px-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {periodDisplay.primary}
                        </span>
                        {periodDisplay.secondary && (
                          <span className="text-[11px] text-gray-500 font-medium">
                            {periodDisplay.secondary}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột 2: Số đơn (căn giữa) */}
                    <td className="py-2.5 px-3.5 sm:px-4 align-middle text-center tabular-nums font-medium text-gray-700">
                      {item.orderCount}
                    </td>

                    {/* Cột 3: Tiền mặt (căn phải) */}
                    <td className="py-2.5 px-3.5 sm:px-4 align-middle text-right tabular-nums font-medium text-gray-700">
                      {formatCurrency(item.cashAmount)}
                    </td>

                    {/* Cột 4: Thẻ POS (căn phải) */}
                    <td className="py-2.5 px-3.5 sm:px-4 align-middle text-right tabular-nums font-medium text-gray-700">
                      {formatCurrency(item.cardAmount)}
                    </td>

                    {/* Cột 5: Chuyển khoản QR (căn phải) */}
                    <td className="py-2.5 px-3.5 sm:px-4 align-middle text-right tabular-nums font-medium text-gray-700">
                      {formatCurrency(item.qrAmount)}
                    </td>

                    {/* Cột 6: Tổng doanh thu (căn phải) */}
                    <td className="py-2.5 px-3.5 sm:px-4 align-middle text-right tabular-nums font-semibold text-rms-burgundy">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                );
              })}
          </tbody>

          {/* Hàng TỔNG CỘNG ở cuối bảng */}
          {!isLoading && summary && timeline.length > 0 && (
            <tfoot className="font-bold text-gray-900">
              <tr>
                <td className="sticky bottom-0 z-10 border-t-2 border-gray-200 bg-gray-50 py-3 px-3.5 text-left text-[11px] uppercase tracking-wider text-rms-charcoal sm:px-4">
                  TỔNG CỘNG
                </td>
                <td className="sticky bottom-0 z-10 border-t-2 border-gray-200 bg-gray-50 py-3 px-3.5 text-center font-semibold tabular-nums text-amber-800 sm:px-4">
                  {summary.totalOrders}
                </td>
                <td className="sticky bottom-0 z-10 border-t-2 border-gray-200 bg-gray-50 py-3 px-3.5 text-right font-semibold tabular-nums text-gray-800 sm:px-4">
                  {formatCurrency(summary.cashAmount)}
                </td>
                <td className="sticky bottom-0 z-10 border-t-2 border-gray-200 bg-gray-50 py-3 px-3.5 text-right font-semibold tabular-nums text-gray-800 sm:px-4">
                  {formatCurrency(summary.cardAmount)}
                </td>
                <td className="sticky bottom-0 z-10 border-t-2 border-gray-200 bg-gray-50 py-3 px-3.5 text-right font-semibold tabular-nums text-gray-800 sm:px-4">
                  {formatCurrency(summary.qrAmount)}
                </td>
                <td className="sticky bottom-0 z-10 border-t-2 border-gray-200 bg-gray-50 py-3 px-3.5 text-right text-sm font-bold tabular-nums text-rms-burgundy sm:px-4">
                  {formatCurrency(summary.totalRevenue)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default RevenueTable;
