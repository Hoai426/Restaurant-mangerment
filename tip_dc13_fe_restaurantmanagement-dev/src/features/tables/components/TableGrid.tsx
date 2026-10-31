"use client";

import React from "react";
import {
  TableCellsIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { TableCard } from "./TableCard";
import type { RestaurantTable } from "@/types/table";

export interface TableGridProps {
  tables: RestaurantTable[];
  totalCount?: number;
  canCreate: boolean;
  canEdit: boolean | ((table: RestaurantTable) => boolean);
  canUpdateStatus?: boolean;
  onCreateTable: () => void;
  onViewDetail: (tableId: number) => void;
  onEdit: (table: RestaurantTable) => void;
  onUpdateStatus?: (table: RestaurantTable) => void;
  onResetFilter?: () => void;
}

export function TableGrid({
  tables,
  totalCount,
  canCreate,
  canEdit,
  canUpdateStatus = false,
  onCreateTable,
  onViewDetail,
  onEdit,
  onUpdateStatus,
  onResetFilter,
}: TableGridProps) {
  if (tables.length === 0) {
    if (totalCount !== undefined && totalCount > 0) {
      return (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mb-4">
            <FunnelIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Không tìm thấy bàn ăn phù hợp
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Không có bàn nào thỏa mãn tiêu chí lọc. Vui lòng chọn tiêu chí khác hoặc xóa bộ lọc.
          </p>
          {onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mb-4">
          <TableCellsIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Chưa có bàn ăn nào trong hệ thống
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Hệ thống chưa có bàn ăn nào. Hãy thêm bàn mới và phân bổ vào các phòng ăn.
        </p>
        {canCreate && (
          <button
            type="button"
            onClick={onCreateTable}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm bàn đầu tiên</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          canEdit={typeof canEdit === "function" ? canEdit(table) : canEdit}
          canUpdateStatus={canUpdateStatus}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}

export default TableGrid;
