"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateCategory } from "../hooks/useCreateCategory";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { CategoryCreateFormData } from "../utils/validation";
import CategoryCreateForm from "./CategoryCreateForm";

export interface CategoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryCreateModal({
  isOpen,
  onClose,
}: CategoryCreateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: createCategory, isPending } = useCreateCategory({
    onSuccess: () => {
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleSubmit = (data: CategoryCreateFormData) => {
    setServerError(null); // Clear lỗi cũ ngay trước khi mutation mới kích hoạt
    createCategory(data);
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
      ariaLabelledBy="category-create-modal-title"
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
                id="category-create-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Thêm danh mục mới
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
          <CategoryCreateForm
            isOpen={isOpen}
            isSubmitting={isPending}
            serverError={serverError}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </Modal>
  );
}
