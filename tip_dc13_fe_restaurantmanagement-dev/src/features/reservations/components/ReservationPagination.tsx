"use client";

import React, { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PAGE_SIZE_OPTIONS } from "../constants/reservation.constants";

export interface ReservationPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  disabled?: boolean;
}

export function ReservationPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: ReservationPaginationProps) {
  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers with ellipsis
  const pageNumbers = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const items: (number | "ellipsis")[] = [];
    const current = currentPage;

    // Always include first page
    items.push(0);

    if (current > 3) {
      items.push("ellipsis");
    }

    // Nearby pages
    const start = Math.max(1, current - 1);
    const end = Math.min(totalPages - 2, current + 1);

    for (let i = start; i <= end; i++) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }

    if (current < totalPages - 4) {
      items.push("ellipsis");
    }

    // Always include last page
    if (totalPages > 1 && !items.includes(totalPages - 1)) {
      items.push(totalPages - 1);
    }

    return items;
  }, [currentPage, totalPages]);

  if (totalElements === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-gray-700 select-none">
      {/* Left: Summary and Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
        <span>
          Hiển thị <span className="font-semibold text-gray-900">{from}</span> -{" "}
          <span className="font-semibold text-gray-900">{to}</span> trên tổng{" "}
          <span className="font-semibold text-gray-900">{totalElements}</span> bản ghi
        </span>

        <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
          <label htmlFor="reservation-page-size" className="text-gray-500 whitespace-nowrap">
            Hiển thị:
          </label>
          <select
            id="reservation-page-size"
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1 text-xs sm:text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 0 || disabled}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-rms-burgundy text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages - 1 || disabled}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang tiếp"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ReservationPagination;
