"use client";

import React, { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface OrderPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions?: number[];
  recordLabel?: string;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  disabled?: boolean;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PageSizeSelectProps {
  value: number;
  options: number[];
  disabled: boolean;
  onChange: (value: number) => void;
}

function PageSizeSelect({ value, options, disabled, onChange }: PageSizeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.indexOf(value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const openAt = (index: number) => {
    if (options.length === 0) return;
    setActiveIndex(Math.min(Math.max(index, 0), options.length - 1));
    setIsOpen(true);
  };

  const selectOption = (option: number) => {
    onChange(option);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const selectedIndex = Math.max(0, options.indexOf(value));

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(selectedIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(selectedIndex);
    } else if (event.key === "Home") {
      event.preventDefault();
      openAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      openAt(options.length - 1);
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const offset = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + offset + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const activeOption = options[activeIndex];
      if (activeOption !== undefined) selectOption(activeOption);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative z-20">
      <button
        ref={triggerRef}
        id="order-page-size"
        type="button"
        aria-label="Số dòng hiển thị mỗi trang"
        aria-describedby="order-page-size-label"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="order-page-size-listbox"
        disabled={disabled}
        onClick={() => isOpen ? setIsOpen(false) : openAt(Math.max(0, options.indexOf(value)))}
        onKeyDown={handleTriggerKeyDown}
        className={`flex h-8 min-w-[100px] cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-2.5 text-xs font-medium text-rms-charcoal transition-colors focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 disabled:cursor-not-allowed disabled:opacity-50 ${isOpen ? "border-rms-gold" : "border-gray-200 hover:border-rms-gold"}`}
      >
        <span>{value} / trang</span>
        <ChevronDownIcon aria-hidden="true" className={`h-4 w-4 shrink-0 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div
          id="order-page-size-listbox"
          role="listbox"
          aria-label="Số dòng hiển thị mỗi trang"
          onKeyDown={handleListKeyDown}
          className="absolute bottom-full left-0 mb-1 max-h-56 min-w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {options.map((option, index) => {
            const isSelected = option === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={option}
                ref={(element) => { optionRefs.current[index] = element; }}
                role="option"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isSelected}
                onFocus={() => setActiveIndex(index)}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex cursor-pointer items-center gap-2 whitespace-nowrap px-2.5 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rms-gold/50 ${
                  isSelected
                    ? "bg-red-50/80 font-semibold text-rms-burgundy"
                    : "text-rms-charcoal hover:bg-gray-50 hover:text-rms-burgundy"
                }`}
              >
                <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${isSelected ? "bg-rms-burgundy" : "bg-gray-300"}`} />
                <span>{option} / trang</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OrderPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  recordLabel = "đơn hàng",
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: OrderPaginationProps) {
  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);

  // Sinh danh sách số trang có dấu ellipsis
  const pageNumbers = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const items: (number | "ellipsis")[] = [];
    const current = currentPage;

    // Luôn có trang đầu (0)
    items.push(0);

    if (current > 3) {
      items.push("ellipsis");
    }

    // Các trang lân cận
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

    // Luôn có trang cuối
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
      {/* Left: Tóm tắt số lượng và chọn Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
        <span>
          Hiển thị <span className="font-semibold text-gray-900">{from}</span> -{" "}
          <span className="font-semibold text-gray-900">{to}</span> trên tổng{" "}
          <span className="font-semibold text-gray-900">{totalElements}</span> {recordLabel}
        </span>

        <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
          <span id="order-page-size-label" className="text-gray-500 whitespace-nowrap text-xs">
            Hiển thị:
          </span>
          <PageSizeSelect
            value={pageSize}
            options={pageSizeOptions}
            disabled={disabled}
            onChange={onPageSizeChange}
          />
        </div>
      </div>

      {/* Right: Điều hướng trang */}
      <div className="flex items-center gap-1">
        {/* Nút Trước */}
        <button
          type="button"
          disabled={currentPage <= 0 || disabled}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Các nút số trang */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 text-xs">
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
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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

        {/* Nút Sau */}
        <button
          type="button"
          disabled={currentPage >= totalPages - 1 || disabled}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default OrderPagination;
