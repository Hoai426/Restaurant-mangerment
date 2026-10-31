"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TableCellsIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateTable } from "../hooks/useCreateTable";
import { useRooms } from "@/features/rooms";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { RestaurantTable, TableCreateModalProps } from "@/types/table";
import type { TableCreateFormData } from "../utils/validation";
import TableCreateForm from "./TableCreateForm";

export function TableCreateModal({
  isOpen,
  roomId,
  roomName,
  onClose,
  onSuccess,
}: TableCreateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: rooms = [], isLoading: isRoomsLoading } = useRooms();

  const { mutate: createTable, isPending } = useCreateTable({
    onSuccess: (table: RestaurantTable) => {
      setServerError(null);
      onSuccess?.(table);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (data: TableCreateFormData) => {
    setServerError(null);
    createTable({
      roomId: Number(data.roomId),
      tableNumber: data.tableNumber.trim(),
      capacity: Number(data.capacity),
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setServerError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClass="max-w-lg"
      ariaLabelledBy="table-create-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <TableCellsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="table-create-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Thêm bàn mới
              </h3>
              <p className="text-xs text-gray-500">
                {roomName
                  ? `Tạo bàn ăn mới cho phòng "${roomName}"`
                  : "Tạo bàn ăn mới và phân bổ vào phòng ăn"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {isRoomsLoading && !roomId ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-3">
              <svg
                className="animate-spin w-6 h-6 text-rms-gold"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-sm">Đang tải danh sách phòng...</span>
            </div>
          ) : (
            <TableCreateForm
              roomId={roomId}
              roomName={roomName}
              rooms={rooms}
              isRoomsLoading={isRoomsLoading}
              isPending={isPending}
              serverError={serverError}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default TableCreateModal;
