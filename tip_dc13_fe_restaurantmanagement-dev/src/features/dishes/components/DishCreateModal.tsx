"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CakeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateDish } from "../hooks/useCreateDish";
import { uploadDishImage } from "../services/dish-image.service";
import { useImageUploadFlow } from "@/hooks/useImageUploadFlow";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { Category } from "@/types/category";
import type { DishCreateFormData } from "../utils/validation";
import DishCreateForm from "./DishCreateForm";

export interface DishCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export function DishCreateModal({
  isOpen,
  onClose,
  categories = [],
}: DishCreateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { isUploading, uploadImageFile } = useImageUploadFlow({
    uploadFn: uploadDishImage,
  });

  const { mutate: createDish, isPending } = useCreateDish({
    onSuccess: () => {
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleSubmit = async (
    data: DishCreateFormData,
    imageFile: File | null
  ) => {
    setServerError(null);

    // 1. Image Upload Flow
    const uploadResult = await uploadImageFile(imageFile);
    if (!uploadResult.success) {
      setServerError(
        "Không thể tải lên hình ảnh món ăn lên máy chủ lưu trữ. Vui lòng thử lại."
      );
      return; // CRITICAL: Stop here, do NOT call createDish
    }

    // 2. Call POST /api/dishes
    createDish({
      name: data.name.trim(),
      price: data.price,
      description: data.description?.trim() || undefined,
      imageUrl: uploadResult.imageUrl || undefined,
      categoryIds: data.categoryIds,
    });
  };

  const handleClose = () => {
    if (isPending || isUploading) return;
    setServerError(null);
    onClose();
  };

  const isSubmitting = isPending || isUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClass="max-w-xl"
      ariaLabelledBy="dish-create-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <CakeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="dish-create-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Thêm món ăn mới
              </h3>
              <p className="text-xs text-gray-500">
                Thêm món ăn mới vào thực đơn của nhà hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {isOpen && (
            <DishCreateForm
              isSubmitting={isSubmitting}
              serverError={serverError}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DishCreateModal;
