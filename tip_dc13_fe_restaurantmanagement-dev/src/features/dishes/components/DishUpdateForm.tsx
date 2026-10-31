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
import type { Dish, UpdateDishRequest } from "@/types/dish";
import {
  dishUpdateSchema,
  type DishUpdateFormData,
} from "../utils/validation";
import {
  CheckIcon,
} from "@heroicons/react/24/outline";
import { areSetsEqual } from "@/utils/array";

export interface DishUpdateFormProps {
  dish: Dish;
  categories: Category[];
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (payload: UpdateDishRequest, imageFile: File | null) => void | Promise<void>;
  onCancel: () => void;
}

export function DishUpdateForm({
  dish,
  categories,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: DishUpdateFormProps) {
  const {
    selectedFile,
    previewUrl,
    fileError,
    fileInputRef,
    isImageChanged,
    handleFileChange,
    handleRevertFile,
  } = useImageFile({ initialImageUrl: dish.imageUrl });

  const initialCategoryIds = dish.categories?.map((c) => c.id) || [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DishUpdateFormData>({
    resolver: zodResolver(dishUpdateSchema),
    defaultValues: {
      name: dish.name,
      price: dish.price,
      categoryIds: initialCategoryIds,
      description: dish.description || "",
    },
  });

  // Watch form fields for precision dirty checking
  const currentName = useWatch({ control, name: "name" }) ?? "";
  const currentPrice = useWatch({ control, name: "price" });
  const currentCategoryIds = useWatch({ control, name: "categoryIds" }) || [];
  const currentDescription = useWatch({ control, name: "description" }) ?? "";

  const isNameChanged = currentName.trim() !== dish.name.trim();
  const isPriceChanged = Number(currentPrice) !== Number(dish.price);
  const isDescriptionChanged =
    currentDescription.trim() !== (dish.description?.trim() || "");
  const isCategoriesChanged = !areSetsEqual(
    currentCategoryIds,
    initialCategoryIds
  );

  // Form is considered dirty if any field changed or a new image file is chosen
  const isFormDirty =
    isNameChanged ||
    isPriceChanged ||
    isDescriptionChanged ||
    isCategoriesChanged ||
    isImageChanged;

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const handleFormSubmit = (data: DishUpdateFormData) => {
    if (!isFormDirty) return;

    // BE-compatible partial payload:
    // - name + categoryIds luôn được gửi để đáp ứng validation (@NotBlank, @NotEmpty) của backend
    // - các optional fields (price, description) chỉ được gửi khi thực sự thay đổi
    const payload: UpdateDishRequest = {
      name: data.name.trim(),
      categoryIds: data.categoryIds,
    };

    if (isPriceChanged && data.price !== undefined) {
      payload.price = data.price;
    }

    if (isDescriptionChanged) {
      payload.description = data.description?.trim() || "";
    }

    // imageUrl sẽ được đính kèm trong DishUpdateModal nếu người dùng tải lên ảnh mới thành công.
    // KHÔNG gửi lại imageUrl cũ nếu không đổi ảnh.

    onSubmit(payload, selectedFile);
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
            Chưa có danh mục nào trong hệ thống.
          </div>
        ) : (
          <MultiSelect<number>
            id="dish-categories"
            options={categoryOptions}
            selectedValues={currentCategoryIds}
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

      {/* 5. Image Management (Upload new / Revert to current) */}
      <ImageUploadField
        id="dish-update-image-input"
        label="Hình ảnh món ăn"
        previewUrl={previewUrl}
        currentImageUrl={dish.imageUrl}
        fileError={fileError}
        disabled={isSubmitting}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onRevert={handleRevertFile}
        uploadPromptText="Nhấp để tải lên hoặc thay đổi hình ảnh món ăn"
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

export default DishUpdateForm;
