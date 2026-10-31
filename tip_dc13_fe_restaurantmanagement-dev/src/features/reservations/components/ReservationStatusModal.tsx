"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { IconSpinner } from "@/components/common/IconSpinner";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import {
  ArrowPathIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  RESERVATION_STATUS_CONFIG,
  RESERVATION_STATUS_ACTION_CONFIG,
  getAllowedTransitions,
} from "../constants/reservation.constants";
import { useUpdateReservationStatus } from "../hooks/useUpdateReservationStatus";
import type {
  ReservationStatusModalProps,
  UpdatableReservationStatus,
  ReservationResponse,
} from "@/types/reservation";

export function ReservationStatusModal({
  isOpen,
  reservationId,
  currentStatus,
  reservationCode,
  onClose,
  onSuccess,
}: ReservationStatusModalProps) {
  const [userSelectedStatus, setUserSelectedStatus] =
    useState<UpdatableReservationStatus | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const allowedTransitions = useMemo(
    () => getAllowedTransitions(currentStatus),
    [currentStatus]
  );

  // Derive active selection: use user's explicit selection if valid in current transitions, otherwise default to first allowed transition
  const selectedStatus =
    userSelectedStatus && allowedTransitions.includes(userSelectedStatus)
      ? userSelectedStatus
      : allowedTransitions[0] || null;

  const { mutate: updateStatus, isPending } = useUpdateReservationStatus({
    onSuccess: (updatedList: ReservationResponse[]) => {
      setServerError(null);
      onSuccess?.(updatedList);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  if (!isOpen) return null;

  const currentConfig = RESERVATION_STATUS_CONFIG[currentStatus];
  const selectedActionConfig = selectedStatus
    ? RESERVATION_STATUS_ACTION_CONFIG[selectedStatus]
    : null;

  const handleClose = () => {
    if (isPending) return;
    setServerError(null);
    setUserSelectedStatus(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!reservationId || !selectedStatus || isPending) return;
    setServerError(null);
    updateStatus({
      id: reservationId,
      payload: { status: selectedStatus },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full mx-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
              <ArrowPathIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Cập nhật trạng thái đặt bàn
              </h2>
              {reservationCode && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">Mã đơn:</span>
                  <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                    {reservationCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Trạng thái hiện tại */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Trạng thái hiện tại
            </div>
            <div className="flex items-center gap-2.5">
              <Badge
                variant={currentConfig?.variant || "neutral"}
                className={currentConfig?.badgeClass}
              >
                {currentConfig?.label || currentStatus}
              </Badge>
              <span className="text-xs text-gray-500">
                {currentConfig?.description}
              </span>
            </div>
          </div>

          {/* Lỗi từ Server */}
          {serverError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Không thể cập nhật trạng thái</span>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {/* Danh sách trạng thái có thể chuyển đổi */}
          {allowedTransitions.length === 0 ? (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2.5">
              <InformationCircleIcon className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5 text-gray-800">
                  Đơn đặt bàn đã đóng
                </span>
                <span>
                  Đơn đặt bàn hiện đang ở trạng thái đóng ({currentConfig?.label}). Không thể chuyển đổi sang trạng thái khác.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Chọn trạng thái mới <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2.5">
                {allowedTransitions.map((statusKey) => {
                  const statusConf = RESERVATION_STATUS_CONFIG[statusKey];
                  const actionConf = RESERVATION_STATUS_ACTION_CONFIG[statusKey];
                  const isSelected = selectedStatus === statusKey;

                  return (
                    <button
                      key={statusKey}
                      type="button"
                      onClick={() => {
                        setUserSelectedStatus(statusKey);
                        setServerError(null);
                      }}
                      disabled={isPending}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "border-rms-burgundy bg-rms-burgundy/5 ring-1 ring-rms-burgundy/30 shadow-xs"
                          : "border-gray-200 bg-white hover:bg-gray-50/80 hover:border-gray-300"
                      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {/* Radio Indicator */}
                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-rms-burgundy bg-rms-burgundy"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {actionConf.actionLabel}
                          </span>
                          <Badge
                            variant={statusConf.variant}
                            className={`text-[10px] py-0 px-1.5 ${statusConf.badgeClass}`}
                          >
                            {statusConf.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {actionConf.actionDescription}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cảnh báo khi chọn Terminal Status */}
          {selectedActionConfig?.isTerminal && selectedActionConfig.helperWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block mb-0.5">
                  Lưu ý khi đóng đơn đặt bàn
                </span>
                <span>{selectedActionConfig.helperWarning}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="px-5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>

          {allowedTransitions.length > 0 && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || !selectedStatus}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending && <IconSpinner />}
              <span>{isPending ? "Đang cập nhật..." : "Xác nhận cập nhật"}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ReservationStatusModal;
