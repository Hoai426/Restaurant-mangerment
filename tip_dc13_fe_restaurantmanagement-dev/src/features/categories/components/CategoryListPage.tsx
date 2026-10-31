"use client";

import React, { useState } from "react";
import { TagIcon, ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { getAccessToken } from "@/utils/cookie";
import { getRoleFromToken } from "@/utils/auth";
import type { Category } from "@/types/category";
import CategoryTable from "@/features/categories/components/CategoryTable";
import CategoryCreateModal from "@/features/categories/components/CategoryCreateModal";
import CategoryDetailModal from "@/features/categories/components/CategoryDetailModal";
import CategoryUpdateModal from "@/features/categories/components/CategoryUpdateModal";
import CategoryStatusModal from "@/features/categories/components/CategoryStatusModal";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CategoryListPage() {
  useRequireAuth(["ADMIN", "STAFF"]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [togglingCategory, setTogglingCategory] = useState<Category | null>(null);

  const token = getAccessToken();
  const role = token ? getRoleFromToken(token) : null;
  const isAdmin = role === "ADMIN";

  const canCreate = isAdmin;
  const canEdit = isAdmin;
  const canToggleStatus = isAdmin;

  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategories();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <IconSpinner />
        <p className="mt-4 text-sm font-medium">Đang tải danh sách danh mục...</p>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    const errorInfo = getApiErrorMessage(error);
    const title = errorInfo.title || "Không thể tải danh mục";
    const message = errorInfo.message;

    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
          <ExclamationTriangleIcon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-rms-charcoal">{title}</h3>
        {message && message !== title && (
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors bg-rms-gradient shadow-sm hover:opacity-95 cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // 3. Empty State
  if (!categories || categories.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mb-3">
            <TagIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-rms-charcoal">Chưa có danh mục</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Hiện tại chưa có danh mục món ăn nào trong thực đơn của nhà hàng.
          </p>
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm danh mục
            </button>
          )}
        </div>

        <CategoryCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </>
    );
  }

  // 4. Success State
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rms-charcoal tracking-tight">
            Danh mục món ăn
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng{" "}
            <span className="font-semibold text-rms-burgundy">
              {categories.length}
            </span>{" "}
            danh mục trong thực đơn
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm danh mục
          </button>
        )}
      </div>

      {/* Categories Table */}
      <CategoryTable
        categories={categories}
        canEdit={canEdit}
        canToggleStatus={canToggleStatus}
        onViewDetail={(category) => setSelectedCategory(category)}
        onEdit={(category) => setEditingCategory(category)}
        onToggleStatus={(category) => setTogglingCategory(category)}
      />

      {/* Create Category Modal */}
      <CategoryCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Category Detail Modal */}
      <CategoryDetailModal
        categoryId={selectedCategory?.id ?? null}
        isOpen={selectedCategory !== null}
        canEdit={canEdit}
        canToggleStatus={canToggleStatus}
        onClose={() => setSelectedCategory(null)}
        onEdit={(category) => {
          setSelectedCategory(null);
          setEditingCategory(category);
        }}
        onToggleStatus={(category) => {
          setSelectedCategory(null);
          setTogglingCategory(category);
        }}
      />

      {/* Category Update Modal */}
      <CategoryUpdateModal
        category={editingCategory}
        isOpen={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
      />

      {/* Category Status Modal */}
      <CategoryStatusModal
        category={togglingCategory}
        isOpen={togglingCategory !== null}
        onClose={() => setTogglingCategory(null)}
      />
    </div>
  );
}
