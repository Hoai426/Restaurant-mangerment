"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { IconSpinner } from "@/components/common/IconSpinner";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useImageFile } from "@/hooks/useImageFile";
import type { Category } from "@/types/category";
import {
  dishCreateSchema,
  type DishCreateFormData,
} from "../utils/validation";
import {
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

export interface DishCreateFormProps {
  isSubmitting: boolean;
  serverError: string | null;
  categories: Category[];
  onSubmit: (data: DishCreateFormData, imageFile: File | null) => void | Promise<void>;
  onCancel: () => void;
}

export function DishCreateForm({
  isSubmitting,
  serverError,
  categories,
  onSubmit,
  onCancel,
}: DishCreateFormProps) {
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
    setValue,
    formState: { errors },
  } = useForm<DishCreateFormData>({
    resolver: zodResolver(dishCreateSchema),
    defaultValues: {
      name: "",
      price: undefined as unknown as number,
      categoryIds: [],
      description: "",
    },
  });

  const selectedCategoryIds = useWatch({ control, name: "categoryIds" }) || [];

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const handleFormSubmit = (data: DishCreateFormData) => {
    onSubmit(data, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}

      {/* 1. Name */}
      <FormField
        label="Tên món ăn"
        id="dish-name"
        required
        error={errors.name?.message}
      >
        <input
          id="dish-name"
          type="text"
          placeholder="Ví dụ: Phở bò đặc biệt"
          disabled={isSubmitting}
          className="rms-field__input w-full px-3.5 py-2.5"
          {...register("name")}
        />
      </FormField>

      {/* 2. Price */}
      <FormField
        label="Đơn giá (VNĐ)"
        id="dish-price"
        required
        error={errors.price?.message}
      >
        <input
          id="dish-price"
          type="number"
          min="1"
          step="any"
          placeholder="Ví dụ: 65000"
          disabled={isSubmitting}
          className="rms-field__input w-full font-mono px-3.5 py-2.5"
          {...register("price", { valueAsNumber: true })}
        />
      </FormField>

      {/* 3. Categories (Multi-select) */}
      <div className="space-y-1.5">
        <label htmlFor="dish-categories" className="rms-field__label block">
          Danh mục món ăn <span className="text-red-500">*</span>
        </label>

        {categories.length === 0 ? (
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
            Chưa có danh mục nào trong hệ thống. Vui lòng tạo danh mục trước.
          </div>
        ) : (
          <MultiSelect<number>
            id="dish-categories"
            options={categoryOptions}
            selectedValues={selectedCategoryIds}
            onChange={(values) =>
              setValue("categoryIds", values, { shouldValidate: true })
            }
            disabled={isSubmitting}
            hasError={!!errors.categoryIds}
            placeholder="Chọn một hoặc nhiều danh mục..."
            searchPlaceholder="Tìm kiếm danh mục..."
          />
        )}

        {errors.categoryIds && (
          <p className="rms-field__error mt-1" role="alert">
            {errors.categoryIds.message}
          </p>
        )}
      </div>

      {/* 4. Description */}
      <FormField
        label="Mô tả món ăn"
        id="dish-description"
        error={errors.description?.message}
      >
        <textarea
          id="dish-description"
          rows={3}
          placeholder="Mô tả thành phần, hương vị đặc trưng của món ăn (không bắt buộc)..."
          disabled={isSubmitting}
          className="rms-field__input w-full resize-none px-3.5 py-2.5"
          {...register("description")}
        />
      </FormField>

      {/* 5. Image Upload */}
      <ImageUploadField
        id="dish-image-input"
        label="Hình ảnh món ăn"
        previewUrl={previewUrl}
        fileError={fileError}
        disabled={isSubmitting}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onRemove={handleRemoveFile}
        uploadPromptText="Nhấp để tải lên hình ảnh món ăn"
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
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-xs disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <IconSpinner />
              <span>Đang lưu món...</span>
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Thêm món ăn</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default DishCreateForm;
