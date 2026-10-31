"use client";

import { useState } from "react";
import {
  TableCellsIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTables } from "@/features/tables";
import { DashboardOverviewCards, RevenueSummaryWidget } from "@/features/reports";

export default function DashboardClient() {
  useRequireAuth(["ADMIN"]);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  });

  const {
    data: tables = [],
    isLoading: isTablesLoading,
    isError: isTablesError,
    isFetching: isTablesFetching,
    refetch: refetchTables,
  } = useTables();

  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
  const availableTables = tables.filter((t) => t.status === "AVAILABLE").length;
  const reservedTables = tables.filter((t) => t.status === "RESERVED").length;
  const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  return (
    <div>
      {/* Greeting Banner */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-rms-charcoal tracking-tight">
          {greeting}, Quản lý!
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Chúc bạn một ngày làm việc hiệu quả.
        </p>
      </div>

      <DashboardOverviewCards />

      {isTablesError && (
        <div role="alert" className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          <span>Không thể tải tình trạng bàn.</span>
          <button
            type="button"
            onClick={() => refetchTables()}
            disabled={isTablesFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 font-semibold text-red-700 transition-colors hover:bg-red-100/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-1"
          >
            <ArrowPathIcon aria-hidden="true" className={`h-3.5 w-3.5 ${isTablesFetching ? "animate-spin" : ""}`} />
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-3 grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.7fr)]">
        <section aria-label="Tình trạng bàn" className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
          {/* Stat Card 1: Bàn đang phục vụ */}
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 hover:shadow-md transition-shadow xl:flex xl:flex-col xl:justify-center">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bàn đang phục vụ</p>
                <h3 className="text-xl font-bold text-rms-charcoal mt-1 tabular-nums">
                  {isTablesLoading ? "..." : isTablesError ? "—" : `${occupiedTables} / ${totalTables}`}
                </h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                <TableCellsIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-amber-800 font-medium">
              {isTablesLoading ? "Đang tính toán..." : isTablesError ? "Chưa có số liệu" : `Công suất đạt ${occupancyRate}%`}
            </p>
          </div>

          {/* Stat Card 2: Bàn trống sẵn sàng */}
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 hover:shadow-md transition-shadow xl:flex xl:flex-col xl:justify-center">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bàn trống sẵn sàng</p>
                <h3 className="text-xl font-bold text-rms-charcoal mt-1 tabular-nums">
                  {isTablesLoading ? "..." : isTablesError ? "—" : `${availableTables} bàn`}
                </h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              {isTablesLoading ? "Đang cập nhật..." : isTablesError ? "Chưa có số liệu" : "Sẵn sàng đón tiếp khách mới"}
            </p>
          </div>

          {/* Stat Card 3: Bàn đã đặt trước */}
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 hover:shadow-md transition-shadow xl:flex xl:flex-col xl:justify-center">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bàn đã đặt trước</p>
                <h3 className="text-xl font-bold text-rms-charcoal mt-1 tabular-nums">
                  {isTablesLoading ? "..." : isTablesError ? "—" : `${reservedTables} bàn`}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <ClockIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        <div className="min-w-0">
          <RevenueSummaryWidget />
        </div>
      </div>
    </div>
  );
}
