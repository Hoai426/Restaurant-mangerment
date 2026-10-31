"use client";

import React from "react";
import type { Category } from "@/types/category";
import { EyeIcon, TagIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/features/categories/utils/format";

interface CategoryTableProps {
  categories: Category[];
  canEdit?: boolean;
  canToggleStatus?: boolean;
  onViewDetail: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onToggleStatus?: (category: Category) => void;
}

export default function CategoryTable({
  categories,
  canEdit,
  canToggleStatus,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: CategoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100/50 shadow-sm bg-white">
      <table className="rms-table">
        <thead>
          <tr>
            <th className="w-16">ID</th>
            <th className="w-1/4">Tên danh mục</th>
            <th>Mô tả</th>
            <th className="w-36 text-center">Trạng thái</th>
            <th className="w-36">Ngày tạo</th>
            <th className="w-28 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              onClick={() => onViewDetail(category)}
              className="cursor-pointer transition-colors hover:bg-gray-50/80 group"
            >
              {/* ID */}
              <td className="font-mono text-xs font-semibold text-gray-400">
                #{category.id}
              </td>

              {/* Name */}
              <td>
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rms-gold/10 text-rms-gold flex items-center justify-center flex-shrink-0">
                    <TagIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-rms-charcoal text-sm group-hover:text-rms-burgundy transition-colors">
                    {category.name}
                  </span>
                </div>
              </td>

              {/* Description */}
              <td className="text-sm text-gray-500 max-w-md truncate">
                {category.description?.trim() ? category.description : "—"}
              </td>

              {/* Status Badge */}
              <td className="text-center">
                <span
                  className={`rms-badge ${
                    category.isActive
                      ? "rms-badge--active"
                      : "rms-badge--inactive"
                  }`}
                >
                  {category.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
              </td>

              {/* Created At */}
              <td className="text-xs text-gray-500 font-mono">
                {formatDate(category.createdAt)}
              </td>

              {/* Actions */}
              <td className="text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewDetail(category)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/5 transition-colors"
                    title="Xem chi tiết"
                    aria-label={`Xem chi tiết danh mục ${category.name}`}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit?.(category)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/5 transition-colors"
                      title="Chỉnh sửa danh mục"
                      aria-label={`Chỉnh sửa danh mục ${category.name}`}
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canToggleStatus && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus?.(category)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        category.isActive
                          ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                          : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={category.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
                      aria-label={`${category.isActive ? "Ngừng hoạt động" : "Kích hoạt"} danh mục ${category.name}`}
                    >
                      {category.isActive ? (
                        <XCircleIcon className="w-4 h-4" />
                      ) : (
                        <CheckCircleIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
