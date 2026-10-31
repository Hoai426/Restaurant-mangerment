"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUpdateDish } from "../hooks/useUpdateDish";
import { uploadDishImage } from "../services/dish-image.service";
import { useImageUploadFlow } from "@/hooks/useImageUploadFlow";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { Category } from "@/types/category";
import type { Dish, UpdateDishRequest } from "@/types/dish";
import DishUpdateForm from "./DishUpdateForm";

export interface DishUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
  categories: Category[];
}

export function DishUpdateModal({
  isOpen,
  onClose,
  dish,
  categories = [],
}: DishUpdateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { isUploading, uploadImageFile } = useImageUploadFlow({
    uploadFn: uploadDishImage,
  });

  const { mutate: updateDish, isPending } = useUpdateDish({
    onSuccess: () => {
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  if (!dish) return null;

  const handleSubmit = async (
    payload: UpdateDishRequest,
    imageFile: File | null
  ) => {
    setServerError(null);

    const finalPayload: UpdateDishRequest = { ...payload };

    // 1. Upload new image to Supabase Storage if user selected a new file
    if (imageFile) {
      const uploadResult = await uploadImageFile(imageFile);
      if (!uploadResult.success) {
        setServerError(
          "Không thể tải lên hình ảnh món ăn lên máy chủ lưu trữ. Vui lòng thử lại."
        );
        return; // CRITICAL: Stop immediately; do NOT proceed with PATCH
      }
      finalPayload.imageUrl = uploadResult.imageUrl;
    }

    // 2. Call PATCH /api/dishes/{id} with partial payload
    updateDish({
      id: dish.id,
      payload: finalPayload,
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
      ariaLabelledBy="dish-update-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="dish-update-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chỉnh sửa món ăn
              </h3>
              <p className="text-xs text-gray-500">
                Cập nhật thông tin cho món #{dish.id} — {dish.name}
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
            <DishUpdateForm
              dish={dish}
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

export default DishUpdateModal;
