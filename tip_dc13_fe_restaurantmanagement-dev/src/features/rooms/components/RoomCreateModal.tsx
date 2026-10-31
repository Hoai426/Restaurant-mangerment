"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BuildingOffice2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useRoomCategories } from "../hooks/useRoomCategories";
import { uploadRoomImage } from "../services/room-image.service";
import { useImageUploadFlow } from "@/hooks/useImageUploadFlow";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { Room, RoomCreateModalProps, RoomCreateRequest } from "@/types/room";
import type { RoomCreateFormData } from "../utils/validation";
import RoomCreateForm from "./RoomCreateForm";

export function RoomCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: RoomCreateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { isUploading, uploadImageFile } = useImageUploadFlow({
    uploadFn: uploadRoomImage,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useRoomCategories();

  const { mutate: createRoom, isPending } = useCreateRoom({
    onSuccess: (room: Room) => {
      setServerError(null);
      onSuccess?.(room);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleSubmit = async (
    data: RoomCreateFormData,
    imageFile: File | null
  ) => {
    setServerError(null);

    // 1. Upload image using reusable upload flow
    const uploadResult = await uploadImageFile(imageFile);
    if (!uploadResult.success) {
      setServerError(
        "Không thể tải lên hình ảnh phòng lên máy chủ lưu trữ. Vui lòng thử lại."
      );
      return; // Stop here, do NOT call createRoom
    }

    // 2. Call POST /api/rooms
    const payload: RoomCreateRequest = {
      categoryId: data.categoryId,
      name: data.name.trim(),
      ...(data.description?.trim() ? { description: data.description.trim() } : {}),
      ...(uploadResult.imageUrl ? { imageUrl: uploadResult.imageUrl } : {}),
    };

    createRoom(payload);
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
      ariaLabelledBy="room-create-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <BuildingOffice2Icon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="room-create-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Thêm phòng mới
              </h3>
              <p className="text-xs text-gray-500">
                Thêm phòng mới vào hệ thống quản lý nhà hàng
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
            <RoomCreateForm
              isUploading={isUploading}
              isPending={isPending}
              serverError={serverError}
              categories={categories}
              isCategoriesLoading={isCategoriesLoading}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default RoomCreateModal;
