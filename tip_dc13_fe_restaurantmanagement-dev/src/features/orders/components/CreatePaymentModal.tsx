"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { ApiError } from "@/services/api-client";
import { useCreatePayment } from "../hooks/useCreatePayment";
import { useConfirmPayment } from "../hooks/useConfirmPayment";
import { usePaymentByOrderId } from "../hooks/usePaymentByOrderId";
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from "../constants/payment.constants";
import type { OrderResponse } from "@/types/order";
import type { PaymentMethod, PaymentResponse } from "@/types/payment";
import {
  BanknotesIcon,
  CreditCardIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export interface CreatePaymentModalProps {
  isOpen: boolean;
  order: OrderResponse | null;
  onClose: () => void;
  onSuccess: (payment: PaymentResponse) => void;
  onPaymentAlreadyExists: (orderId: number) => void;
}

interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: "CASH",
    label: PAYMENT_METHOD_CONFIG.CASH.label,
    description: PAYMENT_METHOD_CONFIG.CASH.description,
    icon: BanknotesIcon,
  },
  {
    value: "CARD",
    label: PAYMENT_METHOD_CONFIG.CARD.label,
    description: PAYMENT_METHOD_CONFIG.CARD.description,
    icon: CreditCardIcon,
  },
  {
    value: "QR",
    label: PAYMENT_METHOD_CONFIG.QR.label,
    description: PAYMENT_METHOD_CONFIG.QR.description,
    icon: QrCodeIcon,
  },
];

export function CreatePaymentModal({
  isOpen,
  order,
  onClose,
  onSuccess,
  onPaymentAlreadyExists,
}: CreatePaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CASH");
  const [createdPayment, setCreatedPayment] = useState<PaymentResponse | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // 1. Kiểm tra giao dịch hiện có từ Backend API
  const {
    data: existingPayment,
    isLoading: isCheckingPayment,
    isError: isCheckPaymentError,
    error: checkPaymentError,
    refetch: refetchPaymentCheck,
  } = usePaymentByOrderId(order?.id, {
    enabled: isOpen && Boolean(order?.id),
  });

  // 2. Ref guard bảo vệ chống render loop khi gọi onPaymentAlreadyExists
  const notifiedOrderIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      existingPayment &&
      order &&
      existingPayment.orderId === order.id &&
      notifiedOrderIdRef.current !== order.id
    ) {
      notifiedOrderIdRef.current = order.id;
      onPaymentAlreadyExists(order.id);
    }
  }, [existingPayment, order, onPaymentAlreadyExists]);

  // 3. Mutation tạo thanh toán
  const {
    mutate: createPaymentMutation,
    isPending,
    error: mutationError,
    reset: resetMutation,
  } = useCreatePayment({
    onSuccess: (payment) => {
      setCreatedPayment(payment);
      onSuccess(payment);
    },
    onError: (err) => {
      if (err instanceof ApiError && order) {
        const code = err.errorCode ?? err.code;
        if (code === "PAYMENT_ALREADY_EXISTS") {
          onPaymentAlreadyExists(order.id);
        }
      }
    },
  });

  const {
    mutate: confirmPaymentMutation,
    isPending: isConfirmingPayment,
    reset: resetConfirmPayment,
  } = useConfirmPayment({
    onSuccess: (payment) => {
      setCreatedPayment(payment);
      setConfirmError(null);
    },
    onError: (err) => {
      setConfirmError(getApiErrorMessage(err).message);
    },
  });

  const handleModalClose = () => {
    if (isPending || isConfirmingPayment) return;
    setSelectedMethod("CASH");
    setCreatedPayment(null);
    setCopiedTxn(false);
    setConfirmError(null);
    notifiedOrderIdRef.current = null;
    resetMutation();
    resetConfirmPayment();
    onClose();
  };

  const handleCopyTxn = (txnCode: string) => {
    navigator.clipboard?.writeText(txnCode).then(() => {
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    });
  };

  if (!isOpen || !order) return null;

  // Xử lý thông báo lỗi theo ngữ cảnh riêng cho ORDER_NOT_EDITABLE
  const errorMessage = mutationError
    ? mutationError instanceof ApiError &&
      (mutationError.errorCode === "ORDER_NOT_EDITABLE" ||
        mutationError.code === "ORDER_NOT_EDITABLE")
      ? "Đơn hàng đã đóng, không thể tạo thanh toán."
      : getApiErrorMessage(mutationError).message
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isCheckingPayment || Boolean(existingPayment) || order.totalAmount <= 0) {
      return;
    }

    createPaymentMutation({
      orderId: order.id,
      payload: { paymentMethod: selectedMethod },
    });
  };

  const handleConfirmPayment = (payment: PaymentResponse) => {
    setConfirmError(null);
    confirmPaymentMutation({ orderId: payment.orderId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidthClass="max-w-md"
      ariaLabelledBy="create-payment-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden font-sans border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="create-payment-modal-title"
                className="text-base font-bold text-gray-900 tracking-tight"
              >
                Thanh toán
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Mã đơn: <span className="font-semibold text-gray-700">{order.orderCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isPending || isConfirmingPayment}
            onClick={handleModalClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
            title="Đóng modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* TRƯỜNG HỢP 1: ĐANG KIỂM TRA TRẠNG THÁI THANH TOÁN TỪ BACKEND */}
          {isCheckingPayment && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
              <div className="text-rms-burgundy">
                <IconSpinner />
              </div>
              <p className="text-sm font-medium">Đang kiểm tra trạng thái thanh toán...</p>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: LỖI KHI KIỂM TRA THANH TOÁN (ORDER_NOT_FOUND, 401, 403, 500) */}
          {!isCheckingPayment && isCheckPaymentError && (
            <div className="space-y-4 py-2 animate-fade-in">
              <Alert
                type="error"
                message={getApiErrorMessage(checkPaymentError).message}
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => refetchPaymentCheck()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 3: TẠO MỚI THANH TOÁN THÀNH CÔNG TRONG PHIÊN NÀY */}
          {!isCheckingPayment && !isCheckPaymentError && createdPayment && (
            <div className="space-y-5 py-2 animate-fade-in">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${createdPayment.status === "SUCCESS" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700"}`}>
                  {createdPayment.status === "SUCCESS" ? (
                    <CheckCircleIcon className="w-7 h-7" />
                  ) : (
                    <ClockIcon className="w-7 h-7" />
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  {createdPayment.status === "SUCCESS"
                    ? "Thanh toán thành công"
                    : "Giao dịch đang chờ xác nhận"}
                </h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  {createdPayment.status === "SUCCESS"
                    ? "Đã xác nhận nhận tiền. Đơn hàng đã được hoàn tất."
                    : "Kiểm tra đã nhận đủ tiền trước khi xác nhận hoàn tất thanh toán."}
                </p>
              </div>

              {confirmError && <Alert type="error" message={confirmError} />}

              {/* Thông tin giao dịch vừa tạo */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mã giao dịch:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-800 select-all">
                      {createdPayment.transactionCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTxn(createdPayment.transactionCode)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Sao chép mã giao dịch"
                    >
                      {copiedTxn ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-semibold text-gray-700">
                    {PAYMENT_METHOD_CONFIG[createdPayment.paymentMethod]?.label ??
                      createdPayment.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <Badge variant={PAYMENT_STATUS_CONFIG[createdPayment.status]?.variant ?? "warning"}>
                    {PAYMENT_STATUS_CONFIG[createdPayment.status]?.label ?? createdPayment.status}
                  </Badge>
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Số tiền cần thu:</span>
                  <span className="text-base font-extrabold text-rms-burgundy font-mono">
                    {formatCurrency(createdPayment.amount)}
                  </span>
                </div>
              </div>

              {createdPayment.status === "PENDING" ? (
                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isConfirmingPayment}
                    onClick={handleModalClose}
                    className="whitespace-nowrap py-2.5 px-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Để xác nhận sau
                  </button>
                  <button
                    type="button"
                    disabled={isConfirmingPayment}
                    onClick={() => handleConfirmPayment(createdPayment)}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap py-2.5 px-2.5 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirmingPayment ? (
                      <>
                        <IconSpinner />
                        <span className="whitespace-nowrap">Đang xác nhận...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="whitespace-nowrap">Đã thu đủ tiền</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:bg-rms-burgundy/95 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TRƯỜNG HỢP 4: ĐƠN HÀNG ĐÃ CÓ GIAO DỊCH THANH TOÁN TỒN TẠI TRÊN BACKEND */}
          {!isCheckingPayment && !isCheckPaymentError && !createdPayment && existingPayment && (
            <div className="space-y-5 py-2 animate-fade-in">
              {/* Alert thông báo tình trạng */}
              {existingPayment.status === "PENDING" && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Đơn hàng đã có thanh toán</p>
                  <p className="text-amber-700">
                    Đơn hàng này đã có giao dịch thanh toán đang chờ xử lý (PENDING). Vui lòng không tạo thêm giao dịch trùng lặp.
                  </p>
                </div>
              )}
              {existingPayment.status === "SUCCESS" && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Đã hoàn tất thanh toán</p>
                  <p className="text-emerald-700">
                    Đơn hàng này đã được thanh toán thành công (SUCCESS).
                  </p>
                </div>
              )}
              {existingPayment.status === "FAILED" && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
                  <p className="font-bold">Giao dịch thanh toán thất bại</p>
                  <p className="text-red-700">
                    Giao dịch thanh toán trước đó đã thất bại (FAILED). Theo quy định hệ thống, mỗi đơn hàng chỉ liên kết một thanh toán. Vui lòng liên hệ quản trị viên để được hỗ trợ.
                  </p>
                </div>
              )}

              {confirmError && <Alert type="error" message={confirmError} />}

              {/* Thẻ chi tiết giao dịch hiện có */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mã giao dịch:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-800 select-all">
                      {existingPayment.transactionCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTxn(existingPayment.transactionCode)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Sao chép mã giao dịch"
                    >
                      {copiedTxn ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-semibold text-gray-700">
                    {PAYMENT_METHOD_CONFIG[existingPayment.paymentMethod]?.label ??
                      existingPayment.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <Badge variant={PAYMENT_STATUS_CONFIG[existingPayment.status]?.variant ?? "warning"}>
                    {PAYMENT_STATUS_CONFIG[existingPayment.status]?.label ?? existingPayment.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Thời gian tạo:</span>
                  <span className="font-mono text-gray-700">
                    {formatDateTime(existingPayment.createdAt)}
                  </span>
                </div>
                {existingPayment.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Thời gian thanh toán:</span>
                    <span className="font-mono text-gray-700">
                      {formatDateTime(existingPayment.paidAt)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Số tiền:</span>
                  <span className="text-base font-extrabold text-rms-burgundy font-mono">
                    {formatCurrency(existingPayment.amount)}
                  </span>
                </div>
              </div>

              {existingPayment.status === "PENDING" ? (
                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isConfirmingPayment}
                    onClick={handleModalClose}
                    className="whitespace-nowrap py-2.5 px-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Để xác nhận sau
                  </button>
                  <button
                    type="button"
                    disabled={isConfirmingPayment}
                    onClick={() => handleConfirmPayment(existingPayment)}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap py-2.5 px-2.5 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirmingPayment ? (
                      <>
                        <IconSpinner />
                        <span className="whitespace-nowrap">Đang xác nhận...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="whitespace-nowrap">Đã thu đủ tiền</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:bg-rms-burgundy/95 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TRƯỜNG HỢP 5: ĐƠN HÀNG CHƯA CÓ THANH TOÁN (existingPayment === null) -> FORM CHỌN PHƯƠNG THỨC */}
          {!isCheckingPayment && !isCheckPaymentError && !createdPayment && !existingPayment && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Thông báo lỗi nếu submit thất bại */}
              {errorMessage && <Alert type="error" message={errorMessage} />}

              {/* Tóm tắt đơn hàng (Read-only) */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Bàn phục vụ:</span>
                  <span className="font-semibold text-gray-800">
                    Bàn #{order.tableNumber || order.tableId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Số lượng món:</span>
                  <span className="font-semibold text-gray-800">
                    {order.items?.length ?? 0} món
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Tổng tiền thanh toán:</span>
                  <span className="text-lg font-extrabold text-rms-burgundy font-mono">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Chọn phương thức thanh toán */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedMethod === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={opt.value}
                          checked={isSelected}
                          disabled={isPending}
                          onChange={() => setSelectedMethod(opt.value)}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex items-center gap-2.5 flex-1">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">{opt.label}</div>
                            <div className="text-[11px] text-gray-500">{opt.description}</div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleModalClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending || order.totalAmount <= 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:bg-rms-burgundy/95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <IconSpinner />
                      <span>Đang ghi nhận...</span>
                    </>
                  ) : (
                    <span>Ghi nhận giao dịch</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CreatePaymentModal;
