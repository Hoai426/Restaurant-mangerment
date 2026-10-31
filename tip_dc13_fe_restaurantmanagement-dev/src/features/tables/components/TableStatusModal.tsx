"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TABLE_STATUS_CONFIG } from "../constants/table.constants";
import { useUpdateTableStatus } from "../hooks/useUpdateTableStatus";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type {
  RestaurantTable,
  TableStatus,
  TableStatusModalProps,
} from "@/types/table";

interface TableStatusFormProps {
  table: RestaurantTable;
  onClose: () => void;
  onSuccess?: (updatedTable: RestaurantTable) => void;
}

function TableStatusForm({ table, onClose, onSuccess }: TableStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<TableStatus>(table.status);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: updateStatus, isPending } = useUpdateTableStatus({
    onSuccess: (updatedTable) => {
      setServerError(null);
      onSuccess?.({ ...table, ...updatedTable, status: selectedStatus });
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const isStatusChanged = selectedStatus !== table.status;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStatusChanged) {
      onClose();
      return;
    }
    setServerError(null);
    updateStatus({
      id: table.id,
      payload: { status: selectedStatus },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {serverError && <Alert type="error" message={serverError} />}

      <div className="space-y-3">
        {(Object.keys(TABLE_STATUS_CONFIG) as TableStatus[]).map((statusKey) => {
          const config = TABLE_STATUS_CONFIG[statusKey];
          const isSelected = selectedStatus === statusKey;
          const isCurrent = table.status === statusKey;

          return (
            <label
              key={statusKey}
              htmlFor={`status-option-${statusKey}`}
              className={`relative flex items-start p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-rms-gold bg-amber-50/20 ring-2 ring-rms-gold/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white"
              }`}
            >
              <input
                type="radio"
                id={`status-option-${statusKey}`}
                name="tableStatus"
                value={statusKey}
                checked={isSelected}
                onChange={() => setSelectedStatus(statusKey)}
                disabled={isPending}
                className="mt-1 h-4 w-4 text-rms-gold border-gray-300 focus:ring-rms-gold cursor-pointer"
              />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {isCurrent && (
                    <span className="text-xs font-medium text-gray-700 bg-gray-200/80 px-2 py-0.5 rounded-md">
                      Hiện tại
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {config.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Form Action Buttons */}
      <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isPending || !isStatusChanged}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-xs disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed min-w-[130px]"
        >
          {isPending ? (
            <>
              <IconSpinner />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function TableStatusModal({
  isOpen,
  table,
  onClose,
  onSuccess,
}: TableStatusModalProps) {
  if (!isOpen || !table) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-md"
      ariaLabelledBy="table-status-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="table-status-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Cập nhật trạng thái bàn #{table.tableNumber}
              </h3>
              <p className="text-xs text-gray-500">
                Chọn trạng thái phục vụ mới cho bàn ăn này
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <TableStatusForm
          key={table.id}
          table={table}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </Modal>
  );
}

export default TableStatusModal;
