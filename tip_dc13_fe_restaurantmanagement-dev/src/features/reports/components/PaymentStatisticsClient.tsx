"use client";

import React, { useMemo, useState } from "react";
import { ArrowPathIcon, BanknotesIcon, CreditCardIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatCurrency } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { ReportDatePreset } from "@/types/report";
import { buildPaymentStatisticsFilters, mapPaymentMethods, mapPaymentStatuses } from "../constants/payment-report.constants";
import { usePaymentStatistics } from "../hooks/usePaymentStatistics";
import { PaymentStatisticsFilterBar } from "./PaymentStatisticsFilterBar";
import { PaymentStatisticsCharts } from "./PaymentStatisticsCharts";

type PaymentStatisticsPanelView = "chart" | "table";

export function PaymentStatisticsClient() {
  useRequireAuth(["ADMIN"]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState<ReportDatePreset | null>(null);
  const [methodView, setMethodView] = useState<PaymentStatisticsPanelView>("chart");
  const [statusView, setStatusView] = useState<PaymentStatisticsPanelView>("chart");
  const isInvalidRange = Boolean(startDate && endDate && startDate > endDate);

  const filters = useMemo(
    () => buildPaymentStatisticsFilters(startDate, endDate),
    [startDate, endDate]
  );
  const request = useMemo(() => ({ filters }), [filters]);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePaymentStatistics(request, { enabled: !isInvalidRange });

  const handleDateChange = (start: string, end: string, preset: ReportDatePreset | null) => {
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset);
  };

  const byMethod = mapPaymentMethods(data?.byMethod);
  const byStatus = mapPaymentStatuses(data?.byStatus);
  const isReportLoading = isLoading || isFetching;

  return (
    <section className="space-y-4" aria-labelledby="payment-statistics-title">
      <header className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rms-burgundy/10 text-rms-burgundy">
          <CreditCardIcon aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h1 id="payment-statistics-title" className="text-2xl font-bold tracking-tight text-gray-900">Thống kê thanh toán</h1>
          <p className="text-sm text-gray-500">Tổng hợp giao dịch theo phương thức và trạng thái thanh toán.</p>
        </div>
      </header>

      <PaymentStatisticsFilterBar
        startDate={startDate}
        endDate={endDate}
        activePreset={activePreset}
        isInvalidRange={isInvalidRange}
        isFetching={isFetching}
        isError={isError}
        data={data}
        onDateChange={handleDateChange}
        onRefresh={() => refetch()}
      />

      {isFetching && !isLoading && !isError && !isInvalidRange && (
        <div role="status" aria-live="polite" className="inline-flex items-center gap-2 self-start rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
          <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-amber-600" />
          <span>Đang cập nhật số liệu...</span>
        </div>
      )}

      {isError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <div className="flex items-start gap-2.5">
            <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <strong className="block font-bold">{getApiErrorMessage(error).title}:</strong>
              <span>{getApiErrorMessage(error).message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700 transition-colors hover:bg-red-100/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2"
          >
            <ArrowPathIcon aria-hidden="true" className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {!isInvalidRange && !isError && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="flex min-h-[112px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tổng giao dịch</p>
              {isReportLoading ? <div className="mt-3 h-8 w-28 animate-pulse rounded bg-gray-200" /> : (
                <p className="mt-1 text-xl font-bold tracking-tight text-gray-900 tabular-nums">
                  {(data?.summary.totalPayments ?? 0).toLocaleString("vi-VN")}
                  <span className="ml-1.5 text-xs font-normal text-gray-400">giao dịch</span>
                </p>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rms-burgundy/10 text-rms-burgundy">
              <CreditCardIcon aria-hidden="true" className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 border-t border-gray-100/80 pt-1.5 text-[11px] text-gray-500">Số giao dịch trong phạm vi lọc</p>
        </article>

        <article className="flex min-h-[112px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tổng tiền giao dịch</p>
              {isReportLoading ? <div className="mt-3 h-8 w-36 animate-pulse rounded bg-gray-200" /> : (
                <p className="mt-1 text-xl font-bold tracking-tight text-rms-burgundy tabular-nums">
                  {formatCurrency(data?.summary.totalAmount ?? 0)}
                </p>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rms-burgundy/10 text-rms-burgundy">
              <BanknotesIcon aria-hidden="true" className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 border-t border-gray-100/80 pt-1.5 text-[11px] text-gray-500">Bao gồm giao dịch ở mọi trạng thái</p>
        </article>
      </div>}

      {!isInvalidRange && data?.summary.totalPayments === 0 && !isReportLoading && !isError && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Không có giao dịch trong khoảng thời gian đã chọn.
        </p>
      )}

      {!isInvalidRange && !isError && (
        <>
          <PaymentStatisticsCharts
            byMethod={byMethod}
            byStatus={byStatus}
            isLoading={isReportLoading || !data}
            methodView={methodView}
            statusView={statusView}
            onMethodViewChange={() => setMethodView((view) => (view === "chart" ? "table" : "chart"))}
            onStatusViewChange={() => setStatusView((view) => (view === "chart" ? "table" : "chart"))}
          />
        </>
      )}
    </section>
  );
}

export default PaymentStatisticsClient;
