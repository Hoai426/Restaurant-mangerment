"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  categoryCreateSchema,
  type CategoryCreateFormData,
} from "../utils/validation";

export interface CategoryCreateFormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (data: CategoryCreateFormData) => void;
  onCancel: () => void;
}

export default function CategoryCreateForm({
  isOpen,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: CategoryCreateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryCreateFormData>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({ name: "", description: "" });
    }
  }, [isOpen, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <Alert type="error" message={serverError} />}

      <FormField
        label="Tên danh mục"
        id="category-name"
        required
        error={errors.name?.message}
      >
        <input
          id="category-name"
          type="text"
          placeholder="Ví dụ: Khai vị"
          disabled={isSubmitting}
          className="rms-field__input w-full"
          {...register("name")}
        />
      </FormField>

      <FormField
        label="Mô tả"
        id="category-description"
        error={errors.description?.message}
      >
        <textarea
          id="category-description"
          rows={3}
          placeholder="Ví dụ: Các món ăn nhẹ dùng trước món chính"
          disabled={isSubmitting}
          className="rms-field__input w-full resize-none"
          {...register("description")}
        />
      </FormField>

      <div className="pt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-sm disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <IconSpinner />
              <span>Đang tạo...</span>
            </>
          ) : (
            "Thêm danh mục"
          )}
        </button>
      </div>
    </form>
  );
}
