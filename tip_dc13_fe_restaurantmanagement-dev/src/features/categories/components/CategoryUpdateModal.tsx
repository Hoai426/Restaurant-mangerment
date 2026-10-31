"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUpdateCategory } from "../hooks/useUpdateCategory";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { Category } from "@/types/category";
import type { CategoryUpdateFormData } from "../utils/validation";
import CategoryUpdateForm from "./CategoryUpdateForm";

export interface CategoryUpdateModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryUpdateModal({
  category,
  isOpen,
  onClose,
}: CategoryUpdateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: updateCategory, isPending } = useUpdateCategory({
    onSuccess: () => {
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleSubmit = (data: CategoryUpdateFormData) => {
    if (!category) return;
    setServerError(null); // Clear lỗi cũ ngay trước khi mutation mới kích hoạt
    updateCategory({
      id: category.id,
      data: {
        name: data.name.trim(),
        description: data.description?.trim() ? data.description.trim() : undefined,
      },
    });
  };

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClass="max-w-lg"
      ariaLabelledBy="category-update-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="category-update-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Cập nhật danh mục
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {category && (
            <CategoryUpdateForm
              category={category}
              isOpen={isOpen}
              isSubmitting={isPending}
              serverError={serverError}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
