"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PencilSquareIcon, XMarkIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useTables } from "@/features/tables";
import { useReservationDetail } from "../hooks/useReservationDetail";
import { useUpdateReservation } from "../hooks/useUpdateReservation";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type {
  ReservationUpdateModalProps,
  ReservationResponse,
  ReservationUpdateRequest,
} from "@/types/reservation";
import ReservationUpdateForm from "./ReservationUpdateForm";

export function ReservationUpdateModal({
  reservationId,
  isOpen,
  onClose,
  onSuccess,
}: ReservationUpdateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const isPositiveIntId =
    typeof reservationId === "number" &&
    Number.isInteger(reservationId) &&
    reservationId > 0;

  // Detail query: enabled ONLY when modal is open and reservationId is a valid positive integer
  const {
    data: reservations,
    isLoading: isReservationLoading,
    isError: isReservationError,
    error: reservationError,
  } = useReservationDetail(reservationId as number, {
    enabled: isOpen && isPositiveIntId,
  });

  // Fetch tables for table assignment
  const { data: tables = [], isLoading: isTablesLoading } = useTables();

  const { mutate: updateReservation, isPending } = useUpdateReservation({
    onSuccess: (updatedReservations: ReservationResponse[]) => {
      setServerError(null);
      onSuccess?.(updatedReservations);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (payload: ReservationUpdateRequest | null) => {
    // Pristine check: if no fields were changed, do not call PATCH API
    if (payload === null) {
      onClose();
      return;
    }

    if (!reservationId || !isPositiveIntId) return;

    setServerError(null);
    updateReservation({
      id: reservationId,
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
      maxWidthClass="max-w-5xl xl:max-w-6xl w-full"
      ariaLabelledBy="reservation-update-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center shrink-0">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="reservation-update-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chỉnh sửa đặt bàn
              </h3>
              <p className="text-xs text-gray-500">
                Cập nhật thông tin khách hàng, thời gian hoặc thay đổi bàn ăn
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
        <div className="overflow-y-auto flex-1 flex flex-col min-h-[320px]">
          {!isPositiveIntId ? (
            <div className="m-auto text-center p-8 max-w-md">
              <ExclamationCircleIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-800 mb-1">
                Mã đặt bàn không hợp lệ
              </h4>
              <p className="text-xs text-gray-500 mb-6">
                Không thể tải thông tin đặt bàn do mã định danh không đúng định dạng.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          ) : isReservationLoading ? (
            <div className="m-auto text-center py-16 flex flex-col items-center justify-center gap-3 text-rms-gold">
              <IconSpinner />
              <span className="text-sm font-medium text-gray-500">
                Đang tải chi tiết đặt bàn...
              </span>
            </div>
          ) : isReservationError || !reservations || reservations.length === 0 ? (
            <div className="m-auto text-center p-8 max-w-md">
              <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-800 mb-1">
                Không tìm thấy thông tin đặt bàn
              </h4>
              <p className="text-xs text-gray-500 mb-6">
                {reservationError
                  ? getApiErrorMessage(reservationError).message
                  : "Đơn đặt bàn này không tồn tại hoặc đã bị xóa khỏi hệ thống."}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          ) : (
            <ReservationUpdateForm
              reservations={reservations}
              tables={tables}
              isTablesLoading={isTablesLoading}
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

export default ReservationUpdateModal;
