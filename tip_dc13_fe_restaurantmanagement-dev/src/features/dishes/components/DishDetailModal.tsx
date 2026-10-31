"use client";

import React from "react";
import type { Category } from "@/types/category";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/Badge";
import { DetailBanner } from "@/components/ui/DetailBanner";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useDishDetail } from "../hooks/useDishDetail";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getCategoryName } from "../helpers/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import {
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { Dish } from "@/types/dish";

export interface DishDetailModalProps {
  dishId: number | null;
  categories?: Category[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (dish: Dish) => void;
  onToggleStatus?: (dish: Dish) => void;
}

export function DishDetailModal({
  dishId,
  categories,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}: DishDetailModalProps) {
  const { data: dish, isLoading, isError, error } = useDishDetail(dishId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      ariaLabelledBy="dish-detail-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2
              id="dish-detail-modal-title"
              className="text-lg font-bold text-rms-charcoal"
            >
              Chi tiết món ăn
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <IconSpinner />
              <p className="mt-3 text-sm font-medium">Đang tải thông tin món ăn...</p>
            </div>
          )}

          {/* 2. Error State */}
          {isError && (
            <div className="py-6">
              <Alert
                type="error"
                message={getApiErrorMessage(error).message}
              />
            </div>
          )}

          {/* 3. Success State */}
          {!isLoading && !isError && dish && (
            <div className="space-y-5">
              {/* Image banner */}
              <DetailBanner
                key={dish.id}
                src={dish.imageUrl}
                alt={dish.name}
              />

              {/* Title & Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 max-w-full truncate"
                    title={getCategoryName(dish, categories)}
                  >
                    <TagIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{getCategoryName(dish, categories)}</span>
                  </span>

                  {/* Status Badge */}
                  <StatusBadge
                    isActive={dish.isAvailable}
                    activeText="Đang phục vụ"
                    inactiveText="Tạm ngưng phục vụ"
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="text-xl font-bold text-gray-900 leading-snug break-words"
                    title={dish.name}
                  >
                    {dish.name}
                  </h3>
                  <span className="text-xl font-bold text-rms-burgundy font-mono shrink-0">
                    {formatCurrency(dish.price)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-gray-500 normal-case">
                  Mô tả món ăn
                </h4>
                <p
                  className={`text-sm leading-relaxed whitespace-pre-line ${
                    dish.description?.trim()
                      ? "text-gray-600"
                      : "text-gray-500 italic"
                  }`}
                >
                  {dish.description?.trim()
                    ? dish.description
                    : "Chưa có mô tả cho món ăn này."}
                </p>
              </div>

              {/* Timestamps: Displaying both createdAt and updatedAt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <div>
                    <span className="text-gray-500 block">Ngày tạo:</span>
                    <span className="font-medium text-gray-700">
                      {formatDateTime(dish.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <div>
                    <span className="text-gray-500 block">Cập nhật lần cuối:</span>
                    <span className="font-medium text-gray-700">
                      {formatDateTime(dish.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200/70 bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {onEdit && dish && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(dish);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rms-gradient rounded-xl transition-colors shadow-xs hover:opacity-95 cursor-pointer"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}

          {onToggleStatus && dish && (
            <button
              type="button"
              onClick={() => onToggleStatus(dish)}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-xs hover:opacity-95 cursor-pointer ${
                dish.isAvailable
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-rms-gradient"
              }`}
            >
              {dish.isAvailable ? (
                <XCircleIcon className="w-4 h-4" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              <span>{dish.isAvailable ? "Ngừng phục vụ" : "Kích hoạt"}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
export default DishDetailModal;
