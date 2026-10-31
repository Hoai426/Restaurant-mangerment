"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTables } from "@/features/tables";
import { useCreateReservation } from "../hooks/useCreateReservation";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { ReservationCreateModalProps, ReservationResponse } from "@/types/reservation";
import type { ReservationCreateFormData } from "../utils/validation";
import ReservationCreateForm from "./ReservationCreateForm";

export function ReservationCreateModal({
  isOpen,
  onClose,
  preselectedTableId,
  onSuccess,
}: ReservationCreateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch all tables so user can select which table(s) to reserve
  const { data: tables = [], isLoading: isTablesLoading } = useTables();

  const { mutate: createReservation, isPending } = useCreateReservation({
    onSuccess: (reservations: ReservationResponse[]) => {
      setServerError(null);
      onSuccess?.(reservations);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (data: ReservationCreateFormData) => {
    setServerError(null);
    createReservation({
      tableIds: data.tableIds,
      customerPhone: data.customerPhone.trim(),
      customerName: data.customerName.trim(),
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime,
      numberOfGuests: data.numberOfGuests,
      note: data.note?.trim() || undefined,
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
      maxWidthClass="max-w-5xl xl:max-w-6xl w-full"
      ariaLabelledBy="reservation-create-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center shrink-0">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="reservation-create-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Đặt bàn mới
              </h3>
              <p className="text-xs text-gray-500">
                Tạo phiếu đặt bàn và phân bổ bàn ăn cho khách hàng
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
        <div className="overflow-y-auto flex-1 flex flex-col">
          <ReservationCreateForm
            tables={tables}
            isTablesLoading={isTablesLoading}
            preselectedTableId={preselectedTableId}
            isPending={isPending}
            serverError={serverError}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </Modal>
  );
}

export default ReservationCreateModal;
