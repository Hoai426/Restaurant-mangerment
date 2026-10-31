"use client";

import React, { useState, useMemo } from "react";
import { useCategories } from "@/features/categories";
import { useDishes } from "../hooks/useDishes";
import { DishTable } from "./DishTable";
import { DishDetailModal } from "./DishDetailModal";
import DishCreateModal from "./DishCreateModal";
import DishUpdateModal from "./DishUpdateModal";
import DishStatusModal from "./DishStatusModal";
import DishFilter from "./DishFilter";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { CakeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getAccessToken } from "@/utils/cookie";
import { getRoleFromToken } from "@/utils/auth";
import type { Dish, SearchRequest, FilterCriteria } from "@/types/dish";

export function DishListPage() {
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [togglingDish, setTogglingDish] = useState<Dish | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ── RM-85: Filter state ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null);

  const token = getAccessToken();
  const role = token ? getRoleFromToken(token) : null;
  const isAdmin = role === "ADMIN";
  const canCreate = isAdmin;

  const { data: categories = [] } = useCategories();

  // ── RM-85: Build SearchRequest từ filter state ────────────────────────────
  const searchRequest = useMemo((): SearchRequest => {
    const filters: FilterCriteria[] = [];

    if (searchQuery.trim()) {
      filters.push({ field: "name", operation: "LIKE", value: searchQuery.trim() });
    }

    if (selectedCategoryId !== null) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) {
        filters.push({ field: "categories.name", operation: "EQ", value: cat.name });
      }
    }

    if (selectedStatus !== null) {
      filters.push({ field: "isAvailable", operation: "EQ", value: selectedStatus });
    }

    return { filters };
  }, [searchQuery, selectedCategoryId, selectedStatus, categories]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setSelectedStatus(null);
  };

  const {
    data: dishes,
    isLoading,
    isError,
    error,
    refetch,
  } = useDishes(searchRequest);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rms-gold/10 text-rms-gold">
              <CakeIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-rms-charcoal tracking-tight">
              Quản lý món ăn
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 pl-10">
            Xem danh sách các món ăn trong thực đơn của nhà hàng
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient hover:-translate-y-0.5 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm món ăn
          </button>
        )}
      </div>

      {/* RM-85: Filter Bar */}
      <DishFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        showStatusFilter={true}
        onCategoryChange={setSelectedCategoryId}
        onSearchChange={setSearchQuery}
        onStatusChange={setSelectedStatus}
        onReset={handleReset}
      />

      {/* Main Content with AsyncStateView */}
      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingMessage="Đang tải danh sách món ăn..."
      >
        <DishTable
          dishes={dishes ?? []}
          categories={categories}
          onViewDetail={(dish) => setSelectedDishId(dish.id)}
          onEdit={isAdmin ? (dish) => setEditingDish(dish) : undefined}
          onToggleStatus={isAdmin ? (dish) => setTogglingDish(dish) : undefined}
        />
      </AsyncStateView>

      {/* Create Modal */}
      <DishCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories}
      />

      {/* Detail Modal */}
      <DishDetailModal
        dishId={selectedDishId}
        categories={categories}
        isOpen={selectedDishId !== null}
        onClose={() => setSelectedDishId(null)}
        onEdit={isAdmin ? (dish) => setEditingDish(dish) : undefined}
        onToggleStatus={
          isAdmin
            ? (dish) => {
                setSelectedDishId(null);
                setTogglingDish(dish);
              }
            : undefined
        }
      />

      {/* Update Modal */}
      <DishUpdateModal
        isOpen={editingDish !== null}
        onClose={() => setEditingDish(null)}
        dish={editingDish}
        categories={categories}
      />

      {/* Status Modal */}
      <DishStatusModal
        dish={togglingDish}
        isOpen={togglingDish !== null}
        onClose={() => setTogglingDish(null)}
      />
    </div>
  );
}

export default DishListPage;
