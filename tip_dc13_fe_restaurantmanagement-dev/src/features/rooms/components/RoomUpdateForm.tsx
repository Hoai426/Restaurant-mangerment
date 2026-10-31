"use client";

import React, { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useImageFile } from "@/hooks/useImageFile";
import type { Room, RoomCategory, RoomUpdateRequest } from "@/types/room";
import {
  roomUpdateSchema,
  type RoomUpdateFormData,
} from "../utils/validation";
import {
  CheckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export interface RoomUpdateFormProps {
  room: Room;
  categories: RoomCategory[];
  isCategoriesLoading?: boolean;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (
    payload: RoomUpdateRequest,
    imageFile: File | null
  ) => void | Promise<void>;
  onCancel: () => void;
}

export function RoomUpdateForm({
  room,
  categories,
  isCategoriesLoading = false,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: RoomUpdateFormProps) {
  const {
    selectedFile,
    previewUrl,
    fileError,
    fileInputRef,
    isImageChanged,
    handleFileChange,
    handleRevertFile,
  } = useImageFile({ initialImageUrl: room.imageUrl });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoomUpdateFormData>({
    resolver: zodResolver(roomUpdateSchema),
    defaultValues: {
      categoryId: room.categoryId,
      name: room.name,
      description: room.description ?? "",
    },
  });

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    [categories]
  );

  // Watch fields for dirty check
  const currentCategoryId = useWatch({ control, name: "categoryId" });
  const currentName = useWatch({ control, name: "name" }) ?? "";
  const currentDescription = useWatch({ control, name: "description" }) ?? "";

  const isCategoryIdChanged =
    currentCategoryId !== undefined &&
    !Number.isNaN(Number(currentCategoryId)) &&
    Number(currentCategoryId) !== Number(room.categoryId);
  const isNameChanged = currentName.trim() !== room.name.trim();
  const isDescriptionChanged =
    currentDescription.trim() !== (room.description?.trim() ?? "");

  const isFormDirty =
    isCategoryIdChanged || isNameChanged || isDescriptionChanged || isImageChanged;

  const handleFormSubmit = (data: RoomUpdateFormData) => {
    if (!isFormDirty) return;

    // Only include fields that actually changed (partial PATCH payload)
    const payload: RoomUpdateRequest = {};

    if (isCategoryIdChanged && data.categoryId !== undefined) {
      payload.categoryId = data.categoryId;
    }
    if (isNameChanged && data.name !== undefined) {
      payload.name = data.name.trim();
    }
    if (isDescriptionChanged) {
      payload.description = data.description?.trim() ?? "";
    }
    // imageUrl is attached in RoomUpdateModal after successful upload

    onSubmit(payload, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}

      {/* 1. Loại phòng (Category) */}
      <FormField
        label="Loại phòng"
        id="room-update-category-id"
        error={errors.categoryId?.message}
      >
        {isCategoriesLoading ? (
          <div className="rms-field__input w-full px-3.5 py-2.5 flex items-center gap-2 text-gray-400 text-sm">
            <IconSpinner />
            <span>Đang tải danh sách loại phòng...</span>
          </div>
        ) : (
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                id="room-update-category-id"
                placeholder="-- Chọn loại phòng --"
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                hasError={!!errors.categoryId}
                icon={<TagIcon className="w-5 h-5" strokeWidth={1.8} />}
              />
            )}
          />
        )}
      </FormField>

      {/* 2. Name */}
      <FormField
        label="Tên phòng"
        id="room-update-name"
        error={errors.name?.message}
      >
        <input
          id="room-update-name"
          type="text"
          placeholder="Ví dụ: Phòng VIP 1, Phòng Tiệc A"
          disabled={isSubmitting}
          maxLength={100}
          className="rms-field__input w-full px-3.5 py-2.5"
          {...register("name")}
        />
      </FormField>

      {/* 3. Description */}
      <FormField
        label="Mô tả phòng"
        id="room-update-description"
        error={errors.description?.message}
      >
        <textarea
          id="room-update-description"
          rows={3}
          placeholder="Mô tả đặc điểm, vị trí hoặc tiện nghi phòng (tối đa 100 ký tự)..."
          disabled={isSubmitting}
          maxLength={100}
          className="rms-field__input w-full resize-none px-3.5 py-2.5"
          {...register("description")}
        />
      </FormField>

      {/* 4. Image */}
      <ImageUploadField
        id="room-update-image-input"
        label="Hình ảnh phòng"
        previewUrl={previewUrl}
        currentImageUrl={room.imageUrl}
        fileError={fileError}
        disabled={isSubmitting}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onRevert={handleRevertFile}
        uploadPromptText="Nhấp để tải lên hoặc thay đổi hình ảnh phòng"
      />

      {/* Form Action Buttons */}
      <div className="pt-3 flex justify-between items-center border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {!isFormDirty && "Chưa có thông tin nào được thay đổi"}
        </span>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!isFormDirty || isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-xs disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <IconSpinner />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default RoomUpdateForm;
