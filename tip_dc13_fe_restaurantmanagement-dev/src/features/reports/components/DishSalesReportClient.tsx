"use client";

import React, { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { OrderPagination } from "@/features/orders/components/OrderPagination";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { DishSalesSortBy, DishSalesSortDirection } from "@/types/report";
import { useDishSalesReport } from "../hooks/useDishSalesReport";
import {
  DISH_SALES_PAGE_SIZE_OPTIONS,
  DISH_SALES_SORT_LABELS,
} from "../constants/dish-sales-report.constants";
import { DishSalesTable } from "./DishSalesTable";
import { TopSellingDishesSection } from "./TopSellingDishesSection";
import { ExportDishSalesExcelButton } from "./ExportDishSalesExcelButton";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export function DishSalesReportClient() {
  useRequireAuth(["ADMIN"]);

  const [viewMode, setViewMode] = useState<"table" | "top">("table");
  const [sortBy, setSortBy] = useState<DishSalesSortBy>("REVENUE");
  const [direction, setDirection] = useState<DishSalesSortDirection>("DESC");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const query = useDishSalesReport({ sortBy, direction, page, size });
  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = query;


  useEffect(() => {
    if (!data || isPlaceholderData) return;

    let validPage = page;
    if (data.totalElements > 0 && page >= data.totalPages) {
      validPage = Math.max(0, data.totalPages - 1);
    } else if (data.totalElements === 0 && page !== 0) {
      validPage = 0;
    }

    if (validPage !== page) {
      // Reconcile the requested page with the latest server pagination metadata.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(validPage);
    }
  }, [data, isPlaceholderData, page]);

  const reportData = isPlaceholderData ? undefined : data;
  const isTableLoading = isLoading || (isPlaceholderData && isFetching);

  const handleSort = (nextSortBy: DishSalesSortBy) => {
    if (sortBy === nextSortBy) {
      setDirection((current) => current === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(nextSortBy);
      setDirection("ASC");
    }
    setPage(0);
  };

  const handlePageSizeChange = (nextSize: number) => {
    setSize(nextSize);
    setPage(0);
  };

  const modeDescription = viewMode === "table"
    ? "Sắp xếp số lượng bán và doanh thu của các món đã bán."
    : "Xếp hạng các món bán chạy theo khoảng thời gian đã chọn.";

  return (
    <section aria-labelledby="dish-sales-title">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
        <header className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rms-burgundy/10 text-rms-burgundy">
              <ShoppingBagIcon aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 id="dish-sales-title" className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                Báo cáo doanh số món ăn
              </h1>
              <p className="text-xs text-gray-500">{modeDescription}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            {viewMode === "table" && isFetching && !isLoading && (
              <div role="status" aria-live="polite" className="inline-flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span>Đang cập nhật...</span>
              </div>
            )}
            <div role="group" aria-label="Chế độ báo cáo" className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                aria-pressed={viewMode === "table"}
                onClick={() => setViewMode("table")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-1 sm:px-3 ${viewMode === "table" ? "bg-rms-burgundy text-white shadow-xs" : "text-gray-600 hover:bg-white hover:text-gray-900"}`}
              >
                <TableCellsIcon aria-hidden="true" className="h-4 w-4" />
                <span>Bảng doanh số</span>
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "top"}
                onClick={() => setViewMode("top")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-1 sm:px-3 ${viewMode === "top" ? "bg-rms-burgundy text-white shadow-xs" : "text-gray-600 hover:bg-white hover:text-gray-900"}`}
              >
                <TrophyIcon aria-hidden="true" className="h-4 w-4" />
                <span>Top bán chạy</span>
              </button>
            </div>
          </div>
        </header>

        <div hidden={viewMode !== "top"}>
          <TopSellingDishesSection embedded />
        </div>

        <div hidden={viewMode !== "table"}>
          {isError && (
            <div role="alert" className="flex items-start justify-between gap-3 border-b border-red-200 bg-red-50 p-4 text-xs text-red-700">
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
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700 transition-colors hover:bg-red-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2"
              >
                <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Thử lại</span>
              </button>
            </div>
          )}

          {(!isError || Boolean(reportData)) && (
            <>
              <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    Sắp xếp hiện tại: {DISH_SALES_SORT_LABELS[sortBy]} ({direction === "ASC" ? "tăng dần" : "giảm dần"})
                  </p>
                  <ExportDishSalesExcelButton
                    items={reportData?.items ?? []}
                    page={page}
                    pageSize={size}
                    totalElements={reportData?.totalElements ?? 0}
                    sortBy={sortBy}
                    direction={direction}
                    disabled={isFetching || isError || isPlaceholderData || !reportData}
                  />
                </div>
              </div>
              <DishSalesTable
                items={reportData?.items ?? []}
                sortBy={sortBy}
                direction={direction}
                isLoading={isTableLoading}
                onSort={handleSort}
              />
              {reportData && reportData.totalElements > 0 && (
                <div className="border-t border-gray-100">
                  <OrderPagination
                    currentPage={page}
                    totalPages={reportData.totalPages}
                    totalElements={reportData.totalElements}
                    pageSize={size}
                    pageSizeOptions={DISH_SALES_PAGE_SIZE_OPTIONS}
                    recordLabel="món"
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                    disabled={isFetching || isPlaceholderData}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default DishSalesReportClient;
