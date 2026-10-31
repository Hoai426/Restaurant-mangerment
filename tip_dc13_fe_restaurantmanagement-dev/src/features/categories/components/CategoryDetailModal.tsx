"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { IconSpinner } from "@/components/common/IconSpinner";
import { Alert } from "@/components/ui/Alert";
import { useCategoryDetail } from "@/features/categories/hooks/useCategoryDetail";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { formatDateTime } from "@/features/categories/utils/format";
import {
  XMarkIcon,
  TagIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { Category } from "@/types/category";

interface CategoryDetailModalProps {
  categoryId: number | null;
  isOpen: boolean;
  canEdit?: boolean;
  canToggleStatus?: boolean;
  onClose: () => void;
  onEdit?: (category: Category) => void;
  onToggleStatus?: (category: Category) => void;
}

export default function CategoryDetailModal({
  categoryId,
  isOpen,
  canEdit,
  canToggleStatus,
  onClose,
  onEdit,
  onToggleStatus,
}: CategoryDetailModalProps) {
  const { data: category, isLoading, isError, error, refetch } = useCategoryDetail(categoryId);
  const errorInfo = isError ? getApiErrorMessage(error) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl" ariaLabelledBy="category-detail-modal-title">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="category-detail-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chi tiết danh mục
              </h3>
              {categoryId && (
                <p className="text-xs text-gray-500 font-mono">Mã ID: #{categoryId}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <IconSpinner />
              <p className="mt-3 text-sm font-medium">Đang tải thông tin danh mục...</p>
            </div>
          )}

          {isError && errorInfo && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-full text-left mb-4">
                <Alert type="error" message={errorInfo.message} />
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-rms-charcoal">
                {errorInfo.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {errorInfo.message}
              </p>
            </div>
          )}

          {!isLoading && !isError && category && (
            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                  Tên danh mục
                </label>
                <p className="mt-1 text-base font-bold text-rms-charcoal">
                  {category.name}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                  Mô tả
                </label>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {category.description?.trim() ? category.description : "Chưa có mô tả cho danh mục này."}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                  Trạng thái hoạt động
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`rms-badge flex items-center gap-1.5 ${
                      category.isActive
                        ? "rms-badge--active"
                        : "rms-badge--inactive"
                    }`}
                  >
                    {category.isActive ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <XCircleIcon className="w-4 h-4" />
                    )}
                    <span>
                      {category.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div>
                  <span className="flex items-center gap-1 text-gray-400 mb-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Ngày tạo
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatDateTime(category.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-1 text-gray-400 mb-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Cập nhật lần cuối
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatDateTime(category.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          {isError && (
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-sm"
            >
              Thử lại
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Đóng
          </button>
          {canEdit && category && (
            <button
              type="button"
              onClick={() => onEdit?.(category)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-sm"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
          {canToggleStatus && category && (
            <button
              type="button"
              onClick={() => onToggleStatus?.(category)}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm ${
                category.isActive
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-rms-gradient"
              }`}
            >
              {category.isActive ? (
                <XCircleIcon className="w-4 h-4" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              <span>{category.isActive ? "Ngừng hoạt động" : "Kích hoạt"}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
