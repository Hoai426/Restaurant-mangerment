"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useTableDetail } from "../hooks/useTableDetail";
import { formatDateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { TABLE_STATUS_CONFIG } from "../constants/table.constants";
import type { TableDetailModalProps } from "@/types/table";
import {
  TableCellsIcon,
  XMarkIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

export function TableDetailModal({
  tableId,
  isOpen,
  onClose,
  onEdit,
  canEdit = false,
  onViewReservationDetail,
}: TableDetailModalProps) {
  const {
    data: table,
    isLoading,
    isError,
    error,
    refetch,
  } = useTableDetail(tableId, { enabled: isOpen });

  const statusConfig = table ? TABLE_STATUS_CONFIG[table.status] : null;
  const isEditable = table
    ? typeof canEdit === "function"
      ? canEdit(table)
      : Boolean(canEdit)
    : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-xl"
      ariaLabelledBy="table-detail-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <TableCellsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="table-detail-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chi tiết bàn ăn
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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
                Đang tải thông tin bàn ăn...
              </p>
            </div>
          )}

          {/* 2. Error State */}
          {isError && (
            <div className="py-6 space-y-4">
              <Alert type="error" message={getApiErrorMessage(error).message} />
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
          {!isLoading && !isError && !table && (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">
                Không tìm thấy thông tin bàn ăn hoặc bàn đã bị xóa.
              </p>
            </div>
          )}

          {/* 4. Success State (Read-only View) */}
          {!isLoading && !isError && table && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Số bàn
                  </span>
                  <h3 className="text-2xl font-bold text-rms-charcoal">
                    Bàn {table.tableNumber}
                  </h3>
                </div>
                {statusConfig && (
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                )}
              </div>

              {/* Thông tin phòng & Sức chứa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                    <BuildingOffice2Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400 block mb-0.5">
                      Phòng ăn
                    </span>
                    <span className="font-semibold text-gray-800 truncate block">
                      {table.roomName || `Phòng #${table.roomId}`}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      (Mã phòng: #{table.roomId})
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                    <UserGroupIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400 block mb-0.5">
                      Sức chứa tối đa
                    </span>
                    <span className="font-semibold text-gray-800 block">
                      {table.capacity} khách
                    </span>
                    <span className="text-xs text-gray-400">
                      Chỗ ngồi tiêu chuẩn
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin đặt bàn liên kết khi bàn RESERVED */}
              {table.status === "RESERVED" && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <CalendarDaysIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-blue-900 truncate">
                        Bàn đang có đơn đặt trước
                      </h4>
                      <p className="text-[11px] text-blue-700 truncate">
                        Xem thông tin khách hàng, khung giờ và các bàn giữ chỗ
                      </p>
                    </div>
                  </div>
                  {onViewReservationDetail && (
                    <button
                      type="button"
                      onClick={() => onViewReservationDetail(table)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-2xs cursor-pointer"
                    >
                      Xem đặt bàn
                    </button>
                  )}
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Ngày tạo:</span>
                  <span className="font-mono font-medium text-gray-700">
                    {formatDateTime(table.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Cập nhật lần cuối:</span>
                  <span className="font-mono font-medium text-gray-700">
                    {formatDateTime(table.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            Đóng
          </button>
          {isEditable && onEdit && table && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(table);
              }}
              title={table.status === "RESERVED" ? "Chỉnh sửa đặt bàn" : "Chỉnh sửa bàn"}
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

export default TableDetailModal;
