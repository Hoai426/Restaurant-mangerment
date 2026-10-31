"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import type { Category } from "@/types/category";
import {
  categoryUpdateSchema,
  type CategoryUpdateFormData,
} from "../utils/validation";

export interface CategoryUpdateFormProps {
  category: Category;
  isOpen: boolean;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (data: CategoryUpdateFormData) => void;
  onCancel: () => void;
}

export default function CategoryUpdateForm({
  category,
  isOpen,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: CategoryUpdateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryUpdateFormData>({
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [isOpen, category, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <Alert type="error" message={serverError} />}

      <FormField
        label="Tên danh mục"
        id="category-update-name"
        required
        error={errors.name?.message}
      >
        <input
          id="category-update-name"
          type="text"
          disabled={isSubmitting}
          className="rms-field__input w-full"
          {...register("name")}
        />
      </FormField>

      <FormField
        label="Mô tả"
        id="category-update-description"
        error={errors.description?.message}
      >
        <textarea
          id="category-update-description"
          rows={3}
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
              <span>Đang cập nhật...</span>
            </>
          ) : (
            "Cập nhật"
          )}
        </button>
      </div>
    </form>
  );
}
