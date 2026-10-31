"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useUpdateRoomStatus } from "../hooks/useUpdateRoomStatus";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import {
  BuildingOffice2Icon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { RoomStatusModalProps } from "@/types/room";

export function RoomStatusModal({
  room,
  isOpen,
  onClose,
  onSuccess,
}: RoomStatusModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const willActivate = !room?.isActive;

  const { mutate: updateStatus, isPending } = useUpdateRoomStatus({
    onSuccess: (updatedRoom) => {
      setServerError(null);
      onSuccess?.(updatedRoom);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleConfirm = () => {
    if (!room || isPending) return;
    setServerError(null);
    updateStatus({ id: room.id, payload: { isActive: willActivate } });
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
      ariaLabelledBy="room-status-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center">
              <BuildingOffice2Icon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="room-status-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Trạng thái phòng ăn
              </h3>
              {room && (
                <p className="text-xs text-gray-500 font-mono">
                  Mã phòng: #{room.id}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {serverError && <Alert type="error" message={serverError} />}

          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center ${
                willActivate
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {willActivate ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <XCircleIcon className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-rms-charcoal">
                {willActivate
                  ? "Kích hoạt phòng ăn"
                  : "Tạm ngưng hoạt động phòng ăn"}
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Bạn có chắc muốn{" "}
                <span className="font-semibold text-rms-charcoal">
                  {willActivate ? "kích hoạt" : "tạm ngưng hoạt động"}
                </span>{" "}
                phòng ăn{" "}
                <span className="font-semibold text-rms-burgundy">
                  &ldquo;{room?.name}&rdquo;
                </span>
                ?{" "}
                {willActivate
                  ? "Phòng ăn sẽ chuyển sang trạng thái Đang hoạt động và sẵn sàng đón khách."
                  : "Phòng ăn sẽ chuyển sang trạng thái Tạm ngưng và không thể xếp bàn/đặt chỗ mới."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              willActivate
                ? "bg-rms-gradient hover:-translate-y-0.5 disabled:hover:translate-y-0"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:-translate-y-0.5 disabled:hover:translate-y-0"
            }`}
          >
            {isPending ? (
              <>
                <IconSpinner />
                <span>Đang xử lý...</span>
              </>
            ) : willActivate ? (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Kích hoạt phòng</span>
              </>
            ) : (
              <>
                <XCircleIcon className="w-4 h-4" />
                <span>Tạm ngưng hoạt động</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default RoomStatusModal;
