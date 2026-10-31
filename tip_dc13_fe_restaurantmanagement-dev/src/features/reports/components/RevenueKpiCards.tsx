"use client";

import React from "react";
import {
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  CalculatorIcon,
  CreditCardIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/format";
import type { RevenueSummary } from "@/types/report";

export interface RevenueKpiCardsProps {
  summary?: RevenueSummary;
  isLoading?: boolean;
}

export function RevenueKpiCards({ summary, isLoading = false }: RevenueKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`kpi-skeleton-${i}`}
            className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-xs animate-pulse flex flex-col justify-between h-[124px] xl:h-[112px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-gray-200 rounded w-24"></div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-7 bg-gray-200 rounded w-36"></div>
            <div className="h-3 bg-gray-100 rounded w-32 border-t border-gray-50 pt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalRev = summary?.totalRevenue ?? 0;
  const totalOrders = summary?.totalOrders ?? 0;
  const aov = summary?.averageOrderValue ?? 0;
  const cash = summary?.cashAmount ?? 0;
  const card = summary?.cardAmount ?? 0;
  const qr = summary?.qrAmount ?? 0;

  // Tính tỷ trọng % cho 3 phương thức
  const cashPct = totalRev > 0 ? Math.round((cash / totalRev) * 100) : 0;
  const cardPct = totalRev > 0 ? Math.round((card / totalRev) * 100) : 0;
  const qrPct = totalRev > 0 ? Math.round((qr / totalRev) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Card 1: Tổng doanh thu */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] xl:min-h-[112px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tổng doanh thu
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-rms-burgundy tracking-tight tabular-nums mt-1">
              {formatCurrency(totalRev)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
            <BanknotesIcon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100/80">
          Chỉ tính trên giao dịch thanh toán thành công
        </p>
      </div>

      {/* Card 2: Tổng số đơn hoàn tất */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] xl:min-h-[112px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Đơn hoàn tất
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-rms-charcoal tracking-tight tabular-nums mt-1">
              {totalOrders.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal text-gray-400">đơn</span>
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100/80">
          Số đơn hàng đã ghi nhận thanh toán
        </p>
      </div>

      {/* Card 3: Giá trị đơn trung bình (AOV) */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] xl:min-h-[112px] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Giá trị TB / đơn (AOV)
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-800 tracking-tight tabular-nums mt-1">
              {formatCurrency(aov)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CalculatorIcon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100/80">
          Doanh thu trung bình trên mỗi đơn hàng
        </p>
      </div>

      {/* Card 4: Cơ cấu phương thức thanh toán */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-xs hover:border-gray-200/80 transition-all flex min-h-[124px] xl:min-h-[112px] flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Cơ cấu thanh toán
          </p>
          <span className="text-[11px] text-gray-400 font-medium">Tỷ trọng</span>
        </div>

        <div className="space-y-1">
          {/* Tiền mặt */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <BanknotesIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tiền mặt:</span>
            </div>
            <div className="text-right flex items-center gap-1">
              <span className="font-semibold text-gray-800 tabular-nums">
                {formatCurrency(cash)}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded tabular-nums">
                {cashPct}%
              </span>
            </div>
          </div>

          {/* Thẻ POS */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <CreditCardIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Thẻ POS:</span>
            </div>
            <div className="text-right flex items-center gap-1">
              <span className="font-semibold text-gray-800 tabular-nums">
                {formatCurrency(card)}
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded tabular-nums">
                {cardPct}%
              </span>
            </div>
          </div>

          {/* Chuyển khoản QR */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <QrCodeIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Chuyển khoản QR:</span>
            </div>
            <div className="text-right flex items-center gap-1">
              <span className="font-semibold text-gray-800 tabular-nums">
                {formatCurrency(qr)}
              </span>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1 py-0.5 rounded tabular-nums">
                {qrPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Thanh tiến trình phân bổ tỷ trọng */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5 mt-1.5">
          {totalRev > 0 ? (
            <>
              {cashPct > 0 && (
                <div
                  style={{ width: `${cashPct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full"
                  title={`Tiền mặt: ${cashPct}%`}
                />
              )}
              {cardPct > 0 && (
                <div
                  style={{ width: `${cardPct}%` }}
                  className="bg-blue-500 h-full"
                  title={`Thẻ POS: ${cardPct}%`}
                />
              )}
              {qrPct > 0 && (
                <div
                  style={{ width: `${qrPct}%` }}
                  className="bg-purple-500 h-full rounded-r-full"
                  title={`QR: ${qrPct}%`}
                />
              )}
            </>
          ) : (
            <div className="bg-gray-200 h-full w-full rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}

export default RevenueKpiCards;
