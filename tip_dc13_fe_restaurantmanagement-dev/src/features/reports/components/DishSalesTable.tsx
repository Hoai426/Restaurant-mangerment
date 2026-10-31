"use client";

import React from "react";
import { ArrowDownIcon, ArrowUpIcon, InboxIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/format";
import type {
  DishSalesReportItem,
  DishSalesSortBy,
  DishSalesSortDirection,
} from "@/types/report";
import { DISH_SALES_SORT_LABELS } from "../constants/dish-sales-report.constants";

interface DishSalesTableProps {
  items: DishSalesReportItem[];
  sortBy: DishSalesSortBy;
  direction: DishSalesSortDirection;
  isLoading: boolean;
  onSort: (sortBy: DishSalesSortBy) => void;
}

const SORT_FIELDS: DishSalesSortBy[] = ["DISH_NAME", "QUANTITY_SOLD", "REVENUE"];

export function DishSalesTable({
  items,
  sortBy,
  direction,
  isLoading,
  onSort,
}: DishSalesTableProps) {
  return (
    <div
      role="region"
      aria-label="Bảng doanh số món ăn, cuộn để xem dữ liệu"
      tabIndex={0}
      className="max-h-none overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rms-burgundy/40 lg:max-h-[min(58vh,540px)]"
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wider text-gray-600 backdrop-blur-xs">
          <tr>
            {SORT_FIELDS.map((field) => {
              const isActive = sortBy === field;
              const ariaSort = isActive
                ? direction === "ASC" ? "ascending" : "descending"
                : "none";

              return (
                <th
                  key={field}
                  scope="col"
                  aria-sort={ariaSort}
                  className={`px-4 py-3 ${field === "DISH_NAME" ? "text-left" : "text-right"}`}
                >
                  <button
                    type="button"
                    onClick={() => onSort(field)}
                    className={`inline-flex items-center gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 ${field === "DISH_NAME" ? "" : "flex-row-reverse"}`}
                  >
                    {isActive && (direction === "ASC"
                      ? <ArrowUpIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      : <ArrowDownIcon aria-hidden="true" className="h-3.5 w-3.5" />)}
                    {DISH_SALES_SORT_LABELS[field]}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {isLoading && Array.from({ length: 5 }).map((_, index) => (
            <tr key={`dish-sales-skeleton-${index}`} className="animate-pulse">
              <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-gray-200" /></td>
              <td className="px-4 py-4"><div className="ml-auto h-4 w-16 rounded bg-gray-200" /></td>
              <td className="px-4 py-4"><div className="ml-auto h-4 w-28 rounded bg-gray-200" /></td>
            </tr>
          ))}

          {!isLoading && items.length === 0 && (
            <tr>
              <td colSpan={3} className="py-10 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
                    <InboxIcon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Chưa có dữ liệu doanh số món ăn</p>
                  <p className="max-w-xs text-xs text-gray-500">
                    Chưa ghi nhận món ăn nào được bán trong các đơn hàng hoàn tất.
                  </p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && items.map((item) => (
            <tr key={item.dishId} className="transition-colors hover:bg-gray-50/70">
              <td className="px-4 py-3.5 font-semibold text-gray-900">{item.dishName}</td>
              <td className="px-4 py-3.5 text-right font-medium tabular-nums text-gray-800">
                {item.quantitySold.toLocaleString("vi-VN")}
              </td>
              <td className="px-4 py-3.5 text-right font-bold tabular-nums text-rms-burgundy">
                {formatCurrency(item.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DishSalesTable;
