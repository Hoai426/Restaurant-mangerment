"use client";

import React from "react";
import type { Room } from "@/types/room";
import { formatDate } from "@/utils/format";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { StatusBadge } from "@/components/ui/Badge";
import {
  BuildingOffice2Icon,
  PencilSquareIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export interface RoomTableProps {
  rooms: Room[];
  canEdit?: boolean;
  onEdit?: (room: Room) => void;
  onViewDetails?: (roomId: number) => void;
  onToggleStatus?: (room: Room) => void;
}

export function RoomTable({
  rooms,
  canEdit = true,
  onEdit,
  onViewDetails,
  onToggleStatus,
}: RoomTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100/70 shadow-sm bg-white">
      <table className="rms-table w-full text-left">
        <thead>
          <tr>
            <th className="w-16">ID</th>
            <th className="w-20 text-center">Hình ảnh</th>
            <th className="w-1/4">Tên phòng</th>
            <th className="w-36">Loại phòng</th>
            <th>Mô tả</th>
            <th className="w-36 text-center">Trạng thái</th>
            <th className="w-32">Ngày tạo</th>
            <th className="w-28 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {rooms.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-gray-500">
                Chưa có phòng ăn nào trong hệ thống.
              </td>
            </tr>
          ) : (
            rooms.map((room) => (
              <tr
                key={room.id}
                onClick={() => onViewDetails?.(room.id)}
                className="transition-colors hover:bg-gray-50/80 group cursor-pointer"
              >
                {/* ID */}
                <td className="font-mono text-xs font-semibold text-gray-400">
                  #{room.id}
                </td>

                {/* Thumbnail */}
                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center">
                    <Thumbnail src={room.imageUrl} alt={room.name} size="md" />
                  </div>
                </td>

                {/* Name */}
                <td>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rms-gold/10 text-rms-gold flex items-center justify-center shrink-0">
                      <BuildingOffice2Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-rms-charcoal text-sm group-hover:text-rms-burgundy transition-colors">
                      {room.name}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                    {room.categoryName || `ID: ${room.categoryId}`}
                  </span>
                </td>

                {/* Description */}
                <td className="text-sm text-gray-500 max-w-xs truncate">
                  {room.description?.trim() ? room.description : "—"}
                </td>

                {/* Status Badge */}
                <td className="text-center">
                  <StatusBadge
                    isActive={room.isActive}
                    activeText="Đang hoạt động"
                    inactiveText="Tạm ngưng"
                  />
                </td>

                {/* Created At */}
                <td className="text-xs text-gray-500 font-mono">
                  {formatDate(room.createdAt)}
                </td>

                {/* Actions */}
                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    {/* View details button - available for all roles */}
                    {onViewDetails && (
                      <button
                        type="button"
                        onClick={() => onViewDetails(room.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/5 transition-colors cursor-pointer"
                        title="Xem chi tiết"
                        aria-label={`Xem chi tiết phòng ${room.name}`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit button - only when canEdit is true */}
                    {canEdit && onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(room)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/5 transition-colors cursor-pointer"
                        title="Chỉnh sửa phòng"
                        aria-label={`Chỉnh sửa phòng ${room.name}`}
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Toggle status button - only when canEdit is true */}
                    {canEdit && onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(room)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          room.isActive
                            ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          room.isActive
                            ? "Tạm ngưng hoạt động phòng"
                            : "Kích hoạt phòng"
                        }
                        aria-label={`${
                          room.isActive ? "Tạm ngưng hoạt động" : "Kích hoạt"
                        } phòng ${room.name}`}
                      >
                        {room.isActive ? (
                          <XCircleIcon className="w-4 h-4" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4" />
                        )}
                      </button>
                    )}
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

export default RoomTable;
