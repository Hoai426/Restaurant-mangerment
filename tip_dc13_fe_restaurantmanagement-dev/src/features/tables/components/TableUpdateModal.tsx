"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TableCellsIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUpdateTable } from "../hooks/useUpdateTable";
import { useRooms } from "@/features/rooms/hooks/useRooms";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type {
  RestaurantTable,
  TableUpdateModalProps,
  TableUpdateRequest,
} from "@/types/table";
import TableUpdateForm from "./TableUpdateForm";

export function TableUpdateModal({
  isOpen,
  table,
  onClose,
  onSuccess,
}: TableUpdateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: rooms = [], isLoading: isRoomsLoading } = useRooms();

  const { mutate: updateTable, isPending } = useUpdateTable({
    onSuccess: (updatedTable: RestaurantTable) => {
      setServerError(null);
      onSuccess?.({ ...table, ...updatedTable });
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  if (!isOpen || !table) return null;

  const handleSubmit = (payload: TableUpdateRequest) => {
    setServerError(null);
    updateTable({
      id: table.id,
      payload,
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
      ariaLabelledBy="table-update-modal-title"
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
                id="table-update-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chỉnh sửa bàn #{table.tableNumber}
              </h3>
              <p className="text-xs text-gray-500">
                Cập nhật thông tin phòng, số bàn hoặc sức chứa
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
          <TableUpdateForm
            table={table}
            rooms={rooms}
            isRoomsLoading={isRoomsLoading}
            isSubmitting={isPending}
            serverError={serverError}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </Modal>
  );
}

export default TableUpdateModal;
