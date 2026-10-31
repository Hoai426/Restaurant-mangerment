"use client";

import React, { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartBarIcon,
  ChartPieIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/format";
import { PAYMENT_METHOD_CONFIG, PAYMENT_STATUS_CONFIG } from "@/features/orders/constants/payment.constants";
import type { PaymentStatisticsByMethod, PaymentStatisticsByStatus } from "@/types/report";
import { PaymentStatisticsTables } from "./PaymentStatisticsTables";

type PaymentStatisticsPanelView = "chart" | "table";

interface PaymentStatisticsChartsProps {
  byMethod: PaymentStatisticsByMethod[];
  byStatus: PaymentStatisticsByStatus[];
  isLoading: boolean;
  methodView: PaymentStatisticsPanelView;
  statusView: PaymentStatisticsPanelView;
  onMethodViewChange: () => void;
  onStatusViewChange: () => void;
}

const noopSubscribe = () => () => {};

function formatAxisCurrency(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} k`;
  return String(value);
}

interface PaymentStatisticsPanelProps {
  id: string;
  title: string;
  description: string;
  view: PaymentStatisticsPanelView;
  isLoading: boolean;
  onViewChange: () => void;
  table: React.ReactNode;
  chart: React.ReactNode;
}

function PaymentStatisticsPanel({
  id,
  title,
  description,
  view,
  isLoading,
  onViewChange,
  table,
  chart,
}: PaymentStatisticsPanelProps) {
  const contentId = `${id}-content`;

  return (
    <section
      className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs"
      aria-labelledby={`${id}-title`}
    >
      <header className="flex flex-col gap-2.5 border-b border-gray-100/80 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rms-burgundy/10 text-rms-burgundy">
            {view === "chart" ? (
              <ChartBarIcon aria-hidden="true" className="h-4 w-4" />
            ) : (
              <TableCellsIcon aria-hidden="true" className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-sm font-bold tracking-tight text-gray-900">
              {view === "chart" ? title : `Chi tiết ${title === "Tổng tiền theo phương thức" ? "phương thức thanh toán" : "trạng thái thanh toán"}`}
            </h2>
            <p className="text-[11px] text-gray-500">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewChange}
          aria-controls={contentId}
          aria-pressed={view === "table"}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-rms-burgundy/30 hover:bg-rms-burgundy/5 hover:text-rms-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy focus-visible:ring-offset-2 sm:self-auto"
        >
          {view === "chart" ? (
            <>
              <TableCellsIcon aria-hidden="true" className="h-4 w-4" />
              <span>Xem bảng chi tiết</span>
            </>
          ) : (
            <>
              <ChartPieIcon aria-hidden="true" className="h-4 w-4" />
              <span>Xem biểu đồ</span>
            </>
          )}
        </button>
      </header>

      <div id={contentId}>
        {view === "table" ? (
          table
        ) : isLoading ? (
          <div className="h-[260px] animate-pulse p-4" aria-label="Đang tải biểu đồ thống kê thanh toán">
            <div className="mb-6 h-5 w-48 rounded bg-gray-200" />
            <div className="h-[190px] rounded-xl bg-gray-50" />
          </div>
        ) : (
          chart
        )}
      </div>
    </section>
  );
}

function PaymentStatisticsCharts({
  byMethod,
  byStatus,
  isLoading,
  methodView,
  statusView,
  onMethodViewChange,
  onStatusViewChange,
}: PaymentStatisticsChartsProps) {
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const methodData = byMethod.map((item) => ({
    name: PAYMENT_METHOD_CONFIG[item.method].label,
    totalAmount: item.totalAmount,
  }));
  const statusData = byStatus.map((item) => ({
    name: PAYMENT_STATUS_CONFIG[item.status].label,
    totalAmount: item.totalAmount,
  }));

  const renderChart = (data: Array<{ name: string; totalAmount: number }>, fill: string, label: string) => (
    <div className="h-[220px] w-full px-2 py-2 sm:px-4" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="name" interval={0} angle={-18} textAnchor="end" height={56} tickMargin={12} tick={{ fontSize: 10, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
          <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} width={56} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Tổng tiền"]} />
          <Bar dataKey="totalAmount" name="Tổng tiền" fill={fill} radius={[6, 6, 0, 0]} maxBarSize={58} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (!isMounted && !isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2" aria-label="Đang tải biểu đồ thống kê thanh toán">
        {[0, 1].map((index) => (
          <div key={index} className="h-[300px] animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="mb-6 h-5 w-48 rounded bg-gray-200" />
            <div className="h-[220px] rounded-xl bg-gray-50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <PaymentStatisticsPanel
        id="payment-method-report"
        title="Tổng tiền theo phương thức"
        description={methodView === "chart" ? "So sánh tổng tiền theo phương thức thanh toán" : "Số giao dịch và tổng tiền theo từng phương thức"}
        view={methodView}
        isLoading={isLoading}
        onViewChange={onMethodViewChange}
        table={<PaymentStatisticsTables view="method" byMethod={byMethod} byStatus={byStatus} isLoading={isLoading} />}
        chart={renderChart(methodData, "#7A1F2B", "Biểu đồ tổng tiền giao dịch theo phương thức thanh toán")}
      />
      <PaymentStatisticsPanel
        id="payment-status-report"
        title="Tổng tiền theo trạng thái"
        description={statusView === "chart" ? "So sánh tổng tiền theo trạng thái thanh toán" : "Số giao dịch và tổng tiền theo từng trạng thái"}
        view={statusView}
        isLoading={isLoading}
        onViewChange={onStatusViewChange}
        table={<PaymentStatisticsTables view="status" byMethod={byMethod} byStatus={byStatus} isLoading={isLoading} />}
        chart={renderChart(statusData, "#A67932", "Biểu đồ tổng tiền giao dịch theo trạng thái thanh toán")}
      />
    </div>
  );
}

export { PaymentStatisticsCharts };
export default PaymentStatisticsCharts;
