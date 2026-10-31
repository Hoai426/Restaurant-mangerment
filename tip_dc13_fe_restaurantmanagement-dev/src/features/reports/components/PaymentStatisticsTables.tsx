"use client";

import React from "react";
import { formatCurrency } from "@/utils/format";
import { PAYMENT_METHOD_CONFIG, PAYMENT_STATUS_CONFIG } from "@/features/orders/constants/payment.constants";
import type { PaymentStatisticsByMethod, PaymentStatisticsByStatus } from "@/types/report";

interface PaymentStatisticsTablesProps {
  view: "method" | "status";
  byMethod: PaymentStatisticsByMethod[];
  byStatus: PaymentStatisticsByStatus[];
  isLoading: boolean;
}

function TableLoadingRows() {
  return Array.from({ length: 3 }).map((_, index) => (
    <tr key={`payment-statistics-skeleton-${index}`} className="animate-pulse">
      <td className="px-4 py-3.5"><div className="h-4 w-28 rounded bg-gray-200" /></td>
      <td className="px-4 py-3.5"><div className="ml-auto h-4 w-12 rounded bg-gray-200" /></td>
      <td className="px-4 py-3.5"><div className="ml-auto h-4 w-24 rounded bg-gray-200" /></td>
    </tr>
  ));
}

export function PaymentStatisticsTables({ view, byMethod, byStatus, isLoading }: PaymentStatisticsTablesProps) {
  const isMethodView = view === "method";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <tr>
            <th scope="col" className="px-4 py-3">{isMethodView ? "Phương thức" : "Trạng thái"}</th>
            <th scope="col" className="px-4 py-3 text-right">Số giao dịch</th>
            <th scope="col" className="px-4 py-3 text-right">Tổng tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {isLoading ? <TableLoadingRows /> : isMethodView ? (
            byMethod.map((item) => (
              <tr key={item.method} className="hover:bg-gray-50/70 transition-colors">
                <th scope="row" className="px-4 py-3.5 text-left font-semibold text-gray-900">{PAYMENT_METHOD_CONFIG[item.method].label}</th>
                <td className="px-4 py-3.5 text-right tabular-nums">{item.paymentCount.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-rms-burgundy">{formatCurrency(item.totalAmount)}</td>
              </tr>
            ))
          ) : (
            byStatus.map((item) => (
              <tr key={item.status} className="hover:bg-gray-50/70 transition-colors">
                <th scope="row" className="px-4 py-3.5 text-left font-semibold text-gray-900">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_CONFIG[item.status].badgeClass}`}>
                    {PAYMENT_STATUS_CONFIG[item.status].label}
                  </span>
                </th>
                <td className="px-4 py-3.5 text-right tabular-nums">{item.paymentCount.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-rms-burgundy">{formatCurrency(item.totalAmount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentStatisticsTables;
