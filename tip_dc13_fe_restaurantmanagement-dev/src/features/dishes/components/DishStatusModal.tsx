"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useUpdateDishStatus } from "../hooks/useUpdateDishStatus";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import {
  CakeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { Dish } from "@/types/dish";

export interface DishStatusModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DishStatusModal({
  dish,
  isOpen,
  onClose,
}: DishStatusModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const willActivate = !dish?.isAvailable;

  const { mutate: updateStatus, isPending } = useUpdateDishStatus({
    onSuccess: () => {
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleConfirm = () => {
    if (isPending || !dish) return;
    setServerError(null);
    updateStatus({ id: dish.id, data: { isAvailable: willActivate } });
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
      ariaLabelledBy="dish-status-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center">
              <CakeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="dish-status-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Trạng thái món ăn
              </h3>
              {dish && (
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Mã món: #{dish.id}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {serverError && <Alert type="error" message={serverError} />}

          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                willActivate
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {willActivate ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <XCircleIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-rms-charcoal">
                {willActivate ? "Kích hoạt món ăn" : "Ngừng phục vụ món ăn"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Bạn có chắc muốn{" "}
                <span className="font-semibold text-rms-charcoal">
                  {willActivate ? "kích hoạt" : "ngừng phục vụ"}
                </span>{" "}
                món ăn{" "}
                <span className="font-semibold text-rms-burgundy">
                  &ldquo;{dish?.name}&rdquo;
                </span>
                ?
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {willActivate
                  ? "Món ăn sẽ chuyển sang trạng thái Còn món và hiển thị phục vụ thực khách."
                  : "Món ăn sẽ chuyển sang trạng thái Tạm hết và tạm ngưng phục vụ."}
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
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer ${
              willActivate
                ? "bg-rms-gradient"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            {isPending && <IconSpinner />}
            <span>
              {isPending
                ? "Đang xử lý..."
                : willActivate
                ? "Kích hoạt"
                : "Ngừng phục vụ"}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DishStatusModal;
