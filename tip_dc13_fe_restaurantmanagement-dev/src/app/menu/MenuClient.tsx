"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useCategories } from "@/features/categories";
import {
  useDishes,
  DishGrid,
  DishDetailModal,
} from "@/features/dishes";
import { AsyncStateView } from "@/components/common/AsyncStateView";

export default function MenuClient() {
  useRequireAuth(["CUSTOMER"]);

  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);

  const {
    data: categories = [],
  } = useCategories();

  const {
    data: dishes,
    isLoading,
    isError,
    error,
    refetch,
  } = useDishes();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Thực đơn món ăn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Khám phá các món ăn hấp dẫn của nhà hàng chúng tôi
        </p>
      </div>

      {/* Main Content with AsyncStateView */}
      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingMessage="Đang tải danh sách món ăn..."
      >
        <DishGrid
          dishes={dishes ?? []}
          categories={categories}
          onSelectDish={(dish) => setSelectedDishId(dish.id)}
        />
      </AsyncStateView>

      {/* Detail Modal */}
      <DishDetailModal
        dishId={selectedDishId}
        categories={categories}
        isOpen={selectedDishId !== null}
        onClose={() => setSelectedDishId(null)}
      />
    </div>
  );
}
