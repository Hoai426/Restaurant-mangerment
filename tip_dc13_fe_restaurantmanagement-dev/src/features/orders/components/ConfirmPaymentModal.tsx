"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { useConfirmPayment } from "../hooks/useConfirmPayment";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { isOrderEditable, ORDER_STATUS_CONFIG } from "../constants/order.constants";
import { PAYMENT_METHOD_CONFIG } from "../constants/payment.constants";
import type { PaymentResponse } from "@/types/payment";
import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CreditCardIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

export interface ConfirmPaymentModalProps {
  isOpen: boolean;
  payment: PaymentResponse | null;
  onClose: () => void;
  onSuccess?: (payment: PaymentResponse) => void;
}

export function ConfirmPaymentModal({
  isOpen,
  payment,
  onClose,
  onSuccess,
}: ConfirmPaymentModalProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isVerifyingOrder, setIsVerifyingOrder] = useState(false);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
    refetch: refetchOrder,
  } = useOrderDetail(payment?.orderId, {
    enabled: isOpen && Boolean(payment?.orderId),
  });

  const confirmMutation = useConfirmPayment({
    onSuccess: (data) => {
      setActionError(null);
      onSuccess?.(data);
      onClose();
    },
    onError: (err) => {
      setActionError(getApiErrorMessage(err).message);
      void refetchOrder();
    },
  });

  if (!isOpen || !payment) return null;

  const handleConfirm = async () => {
    if (
      isOrderLoading ||
      isOrderError ||
      !order ||
      !isOrderEditable(order.status) ||
      payment.status !== "PENDING" ||
      confirmMutation.isPending ||
      isVerifyingOrder
    ) {
      return;
    }

    setActionError(null);
    setIsVerifyingOrder(true);
    try {
      const latestOrder = await refetchOrder();
      if (latestOrder.isError || !latestOrder.data) {
        setActionError(getApiErrorMessage(latestOrder.error).message);
        return;
      }

      if (!isOrderEditable(latestOrder.data.status)) {
        setActionError(
          `Đơn hàng đang ở trạng thái ${ORDER_STATUS_CONFIG[latestOrder.data.status].label.toLowerCase()}, không thể xác nhận giao dịch này.`
        );
        return;
      }

      confirmMutation.mutate({ orderId: payment.orderId });
    } finally {
      setIsVerifyingOrder(false);
    }
  };

  const methodConfig = PAYMENT_METHOD_CONFIG[payment.paymentMethod];
  const canConfirmPayment = Boolean(
    payment.status === "PENDING" && order && isOrderEditable(order.status)
  );

  const getMethodIcon = () => {
    switch (payment.paymentMethod) {
      case "CASH":
        return <BanknotesIcon className="w-4 h-4 text-emerald-600" />;
      case "CARD":
        return <CreditCardIcon className="w-4 h-4 text-blue-600" />;
      case "QR":
        return <QrCodeIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <BanknotesIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!confirmMutation.isPending) {
          setActionError(null);
          onClose();
        }
      }}
      maxWidthClass="max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Xác nhận thanh toán
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Kiểm tra thông tin giao dịch trước khi hoàn tất thu tiền
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={confirmMutation.isPending || isVerifyingOrder}
            onClick={() => {
              if (!isVerifyingOrder) {
                setActionError(null);
                onClose();
              }
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Thông báo lỗi nếu có */}
          {actionError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {actionError}
              </div>
            </div>
          )}

          {isOrderLoading && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              <IconSpinner />
              <span>Đang kiểm tra trạng thái đơn hàng...</span>
            </div>
          )}

          {isOrderError && (
            <div className="space-y-2">
              <Alert type="error" message={getApiErrorMessage(orderError).message} />
              <button
                type="button"
                onClick={() => void refetchOrder()}
                className="text-xs font-semibold text-rms-burgundy hover:underline"
              >
                Thử kiểm tra lại
              </button>
            </div>
          )}

          {order && !isOrderEditable(order.status) && (
            <Alert
              type="error"
              message={`Đơn hàng đang ở trạng thái ${ORDER_STATUS_CONFIG[order.status].label.toLowerCase()}, không thể xác nhận giao dịch này.`}
            />
          )}

          {/* Chi tiết giao dịch */}
          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Mã giao dịch:</span>
              <span className="font-mono font-bold text-gray-900 select-all">
                {payment.transactionCode}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-blue-600">
                {payment.orderCode}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Phương thức:</span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                {getMethodIcon()}
                <span>{methodConfig?.label ?? payment.paymentMethod}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Thời gian tạo:</span>
              <span className="font-mono text-gray-600">
                {formatDateTime(payment.createdAt)}
              </span>
            </div>

            <div className="pt-2.5 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                Số tiền thanh toán:
              </span>
              <span className="font-mono text-xl font-black text-rms-burgundy">
                {formatCurrency(payment.amount)}
              </span>
            </div>
          </div>

          {/* Ghi chú cảnh báo */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-950 block mb-0.5">Lưu ý:</strong>
              Vui lòng đảm bảo nhận đủ số tiền thanh toán từ khách.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            disabled={confirmMutation.isPending}
            onClick={() => {
              setActionError(null);
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={
              confirmMutation.isPending ||
              isVerifyingOrder ||
              isOrderLoading ||
              isOrderError ||
              !canConfirmPayment
            }
            onClick={handleConfirm}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmMutation.isPending || isOrderLoading || isVerifyingOrder ? (
              <>
                <IconSpinner />
                <span>
                  {isOrderLoading || isVerifyingOrder
                    ? "Đang kiểm tra..."
                    : "Đang xử lý..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Xác nhận thanh toán</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmPaymentModal;
