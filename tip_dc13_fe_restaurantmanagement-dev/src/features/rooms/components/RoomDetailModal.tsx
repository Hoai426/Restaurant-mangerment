"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { DetailBanner } from "@/components/ui/DetailBanner";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useRoomDetail } from "../hooks/useRoomDetail";
import { formatDateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { RoomDetailModalProps } from "@/types/room";
import { useRoomTables } from "@/features/tables/hooks/useRoomTables";
import { TABLE_STATUS_CONFIG } from "@/features/tables/constants/table.constants";
import {
  BuildingOffice2Icon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  TableCellsIcon,
  UserGroupIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export function RoomDetailModal({
  roomId,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onEditTable,
  onViewTableDetails,
  canEdit = false,
}: RoomDetailModalProps) {
  const {
    data: room,
    isLoading,
    isError,
    error,
    refetch,
  } = useRoomDetail(roomId);

  const { data: tables = [], isLoading: isTablesLoading } = useRoomTables(
    isOpen ? roomId : null
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      ariaLabelledBy="room-detail-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rms-gold/10 text-rms-gold">
              <BuildingOffice2Icon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="room-detail-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chi tiết phòng ăn
              </h2>
              {room && (
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Mã phòng: #{room.id}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <IconSpinner />
              <p className="mt-3 text-sm font-medium">
                Đang tải thông tin phòng ăn...
              </p>
            </div>
          )}

          {/* 2. Error State */}
          {isError && (
            <div className="py-6 space-y-4">
              <Alert
                type="error"
                message={getApiErrorMessage(error).message}
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rms-burgundy bg-rms-burgundy/5 hover:bg-rms-burgundy/10 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Empty / Not Found State */}
          {!isLoading && !isError && !room && (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">
                Không tìm thấy thông tin phòng ăn hoặc phòng đã bị xóa.
              </p>
            </div>
          )}

          {/* 4. Success State */}
          {!isLoading && !isError && room && (
            <div className="space-y-5">
              {/* Image banner */}
              <DetailBanner
                key={room.id}
                src={room.imageUrl}
                alt={room.name}
              />

              {/* Title & Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Badge */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 max-w-full truncate"
                    title={room.categoryName || `ID: ${room.categoryId}`}
                  >
                    <TagIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {room.categoryName || `ID: ${room.categoryId}`}
                    </span>
                  </span>

                  {/* Status Badge (Reusing common component) */}
                  <StatusBadge
                    isActive={room.isActive}
                    activeText="Đang hoạt động"
                    inactiveText="Tạm ngưng"
                  />
                </div>

                <h3 className="text-xl font-bold text-rms-charcoal">
                  {room.name}
                </h3>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mô tả phòng
                </span>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {room.description?.trim() ? room.description : "Chưa có mô tả cho phòng ăn này."}
                </p>
              </div>

              {/* Timestamp information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Ngày tạo:</span>
                  <span className="font-mono font-medium text-gray-700">
                    {formatDateTime(room.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Cập nhật lần cuối:</span>
                  <span className="font-mono font-medium text-gray-700">
                    {formatDateTime(room.updatedAt)}
                  </span>
                </div>
              </div>

              {/* 5. Tables in Room Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <TableCellsIcon className="w-4 h-4 text-rms-gold" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Danh sách bàn ({tables.length})
                  </span>
                </div>

                {isTablesLoading ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50/60 rounded-xl border border-gray-100 text-gray-400 text-xs">
                    <IconSpinner />
                    <span className="ml-2">Đang tải danh sách bàn...</span>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="p-4 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500">Phòng này hiện chưa có bàn ăn nào.</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                    {tables.map((tbl) => {
                      const statusConfig = TABLE_STATUS_CONFIG[tbl.status];
                      return (
                        <div
                          key={tbl.id}
                          className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50/80 transition-colors group"
                        >
                          <div
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                            onClick={() => {
                              if (onViewTableDetails) {
                                onClose();
                                onViewTableDetails(tbl.id);
                              }
                            }}
                            title="Bấm để xem chi tiết bàn"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 group-hover:bg-rms-gold/15 group-hover:text-rms-gold transition-colors">
                              <TableCellsIcon className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-gray-900 group-hover:text-rms-burgundy transition-colors truncate">
                              Bàn {tbl.tableNumber}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 shrink-0">
                              <UserGroupIcon className="w-3.5 h-3.5 text-gray-400" />
                              {tbl.capacity} người
                            </span>
                            <Badge
                              variant={statusConfig?.variant || "neutral"}
                              className="text-xs px-2 py-0.5 shrink-0"
                            >
                              {statusConfig?.label || tbl.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {onViewTableDetails && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onViewTableDetails(tbl.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Xem chi tiết bàn"
                                aria-label={`Xem chi tiết bàn ${tbl.tableNumber}`}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            )}

                            {canEdit && onEditTable && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onEditTable(tbl);
                                }}
                                className="p-1.5 text-gray-400 hover:text-rms-burgundy hover:bg-rms-burgundy/10 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa bàn"
                                aria-label={`Chỉnh sửa bàn ${tbl.tableNumber}`}
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            Đóng
          </button>

          {canEdit && onToggleStatus && room && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onToggleStatus(room);
              }}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer ${
                room.isActive
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-rms-gradient"
              }`}
            >
              {room.isActive ? (
                <XCircleIcon className="w-4 h-4" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              <span>
                {room.isActive ? "Tạm ngưng hoạt động" : "Kích hoạt phòng"}
              </span>
            </button>
          )}


          {canEdit && onEdit && room && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(room);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default RoomDetailModal;
