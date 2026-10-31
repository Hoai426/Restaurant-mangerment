"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import {
  TableCellsIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  EyeIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { TABLE_STATUS_CONFIG } from "../constants/table.constants";
import type { RestaurantTable } from "@/types/table";

export interface TableCardProps {
  table: RestaurantTable;
  canEdit: boolean;
  canUpdateStatus?: boolean;
  onViewDetail: (tableId: number) => void;
  onEdit: (table: RestaurantTable) => void;
  onUpdateStatus?: (table: RestaurantTable) => void;
}

export function TableCard({
  table,
  canEdit,
  canUpdateStatus = false,
  onViewDetail,
  onEdit,
  onUpdateStatus,
}: TableCardProps) {
  const status = TABLE_STATUS_CONFIG[table.status];

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
      {/* Top Bar: Table Number & Status */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center shrink-0 group-hover:bg-rms-gold group-hover:text-white transition-colors">
              <TableCellsIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-bold text-base text-gray-900 leading-tight truncate"
                title={`Bàn ${table.tableNumber}`}
              >
                Bàn {table.tableNumber}
              </h3>
            </div>
          </div>

          {status && (
            <div className="shrink-0">
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          )}
        </div>

        {/* Room & Capacity Info */}
        <div className="space-y-2 py-3 border-y border-gray-50 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-gray-500">Phòng:</span>
            <span className="font-semibold text-gray-800 truncate">
              {table.roomName || "Chưa phân phòng"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-gray-500">Sức chứa:</span>
            <span className="font-semibold text-gray-800">
              {table.capacity} khách
            </span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 mt-1 flex items-center gap-1.5 flex-nowrap">
        <button
          type="button"
          onClick={() => onViewDetail(table.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer truncate"
          title="Xem chi tiết bàn"
        >
          <EyeIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="truncate">Chi tiết</span>
        </button>

        {canUpdateStatus && onUpdateStatus && (
          <button
            type="button"
            onClick={() => onUpdateStatus(table)}
            className="p-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100/80 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Đổi trạng thái bàn"
            aria-label={`Đổi trạng thái bàn ${table.tableNumber}`}
          >
            <ArrowPathIcon className="w-4 h-4 text-amber-700" />
          </button>
        )}

        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit(table)}
            className="p-1.5 text-rms-burgundy bg-rms-burgundy/5 hover:bg-rms-burgundy/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title={table.status === "RESERVED" ? "Chỉnh sửa đặt bàn" : "Chỉnh sửa bàn"}
            aria-label={table.status === "RESERVED" ? `Chỉnh sửa đặt bàn ${table.tableNumber}` : `Chỉnh sửa bàn ${table.tableNumber}`}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TableCard;
