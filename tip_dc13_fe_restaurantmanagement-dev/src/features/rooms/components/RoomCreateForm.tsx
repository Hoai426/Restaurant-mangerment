"use client";

import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useImageFile } from "@/hooks/useImageFile";
import type { RoomCategory } from "@/types/room";
import {
  roomCreateSchema,
  type RoomCreateFormData,
} from "../utils/validation";
import {
  ArrowUpTrayIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export interface RoomCreateFormProps {
  isUploading: boolean;
  isPending: boolean;
  serverError: string | null;
  categories: RoomCategory[];
  isCategoriesLoading?: boolean;
  onSubmit: (data: RoomCreateFormData, imageFile: File | null) => void | Promise<void>;
  onCancel: () => void;
}

export function RoomCreateForm({
  isUploading,
  isPending,
  serverError,
  categories,
  isCategoriesLoading = false,
  onSubmit,
  onCancel,
}: RoomCreateFormProps) {
  const {
    selectedFile,
    previewUrl,
    fileError,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
  } = useImageFile();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoomCreateFormData>({
    resolver: zodResolver(roomCreateSchema),
    defaultValues: {
      categoryId: undefined as unknown as number,
      name: "",
      description: "",
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

  const isSubmitting = isUploading || isPending;

  const handleFormSubmit = (data: RoomCreateFormData) => {
    if (isSubmitting) return;
    onSubmit(data, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}

      {/* 1. Loại phòng (Category) */}
      <FormField
        label="Loại phòng"
        id="room-category-id"
        required
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
                id="room-category-id"
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
        id="room-name"
        required
        error={errors.name?.message}
      >
        <input
          id="room-name"
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
        id="room-description"
        error={errors.description?.message}
      >
        <textarea
          id="room-description"
          rows={3}
          placeholder="Mô tả đặc điểm, vị trí hoặc tiện nghi phòng (tối đa 100 ký tự)..."
          disabled={isSubmitting}
          maxLength={100}
          className="rms-field__input w-full resize-none px-3.5 py-2.5"
          {...register("description")}
        />
      </FormField>

      {/* 4. Image Upload */}
      <ImageUploadField
        id="room-create-image-input"
        label="Hình ảnh phòng"
        previewUrl={previewUrl}
        fileError={fileError}
        disabled={isSubmitting}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onRemove={handleRemoveFile}
        uploadPromptText="Nhấp để tải lên hình ảnh phòng"
      />

      {/* Form Action Buttons */}
      <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
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
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-xs disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer min-w-[130px]"
        >
          {isUploading ? (
            <>
              <IconSpinner />
              <span>Đang tải ảnh...</span>
            </>
          ) : isPending ? (
            <>
              <IconSpinner />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Thêm phòng</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default RoomCreateForm;
