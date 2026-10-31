"use client";

import React from "react";
import type { Dish } from "@/types/dish";
import type { Category } from "@/types/category";
import { formatCurrency, formatDate } from "@/utils/format";
import { getCategoryName } from "../helpers/format";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { StatusBadge } from "@/components/ui/Badge";
import {
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export interface DishTableProps {
  dishes: Dish[];
  categories?: Category[];
  onViewDetail: (dish: Dish) => void;
  onEdit?: (dish: Dish) => void;
  onToggleStatus?: (dish: Dish) => void;
}

export function DishTable({
  dishes,
  categories,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: DishTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100/70 shadow-sm bg-white">
      <table className="rms-table w-full text-left">
        <thead>
          <tr>
            <th className="w-20">ID</th>
            <th className="w-20 text-center">Hình ảnh</th>
            <th className="w-1/3">Tên món</th>
            <th className="w-36">Danh mục</th>
            <th className="w-32">Đơn giá</th>
            <th className="w-32 text-center">Trạng thái</th>
            <th className="w-32">Ngày tạo</th>
            <th className="w-24 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {dishes.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-gray-500">
                Không tìm thấy món ăn nào phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            dishes.map((dish) => (
              <tr
                key={dish.id}
                onClick={() => onViewDetail(dish)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewDetail(dish);
                  }
                }}
                tabIndex={0}
                role="button"
                className="cursor-pointer transition-colors hover:bg-gray-50/80 group focus:outline-none focus:bg-gray-50"
              >
                {/* ID */}
                <td className="font-mono text-xs font-semibold text-gray-400">
                  #{dish.id}
                </td>

                {/* Thumbnail */}
                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center">
                    <Thumbnail src={dish.imageUrl} alt={dish.name} size="md" />
                  </div>
                </td>

                {/* Name & Short description */}
                <td className="max-w-xs">
                  <div className="flex flex-col">
                    <span
                      className="font-bold text-rms-charcoal text-sm group-hover:text-rms-burgundy transition-colors line-clamp-2"
                      title={dish.name}
                    >
                      {dish.name}
                    </span>
                    <span
                      className="text-xs text-gray-400 line-clamp-2 max-w-xs mt-0.5"
                      title={dish.description?.trim() ? dish.description : undefined}
                    >
                      {dish.description?.trim() ? dish.description : "—"}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 line-clamp-1 max-w-[160px] truncate"
                    title={getCategoryName(dish, categories)}
                  >
                    {getCategoryName(dish, categories)}
                  </span>
                </td>

                {/* Price */}
                <td className="font-mono font-bold text-sm text-rms-burgundy">
                  {formatCurrency(dish.price)}
                </td>

                {/* Status Badge */}
                <td className="text-center">
                  <StatusBadge
                    isActive={dish.isAvailable}
                    activeText="Còn món"
                    inactiveText="Tạm hết"
                  />
                </td>

                {/* Created At */}
                <td className="text-xs text-gray-500 font-mono">
                  {formatDate(dish.createdAt)}
                </td>

                {/* Actions */}
                <td
                  className="text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(dish)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/5 transition-colors cursor-pointer"
                        title="Chỉnh sửa món ăn"
                        aria-label={`Chỉnh sửa món ${dish.name}`}
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(dish)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          dish.isAvailable
                            ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={dish.isAvailable ? "Ngừng phục vụ" : "Kích hoạt món ăn"}
                        aria-label={`${dish.isAvailable ? "Ngừng phục vụ" : "Kích hoạt"} món ${dish.name}`}
                      >
                        {dish.isAvailable ? (
                          <XCircleIcon className="w-5 h-5" />
                        ) : (
                          <CheckCircleIcon className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewDetail(dish)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/5 transition-colors cursor-pointer"
                      title="Xem chi tiết"
                      aria-label={`Xem chi tiết ${dish.name}`}
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export default DishTable;
