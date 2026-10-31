"use client";

import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePayments } from "@/features/orders/hooks/usePayments";
import { PaymentTable } from "@/features/orders/components/PaymentTable";
import { OrderDetailModal } from "@/features/orders/components/OrderDetailModal";
import { ConfirmPaymentModal } from "@/features/orders/components/ConfirmPaymentModal";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { PaymentResponse } from "@/types/payment";
import {
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function PaymentsClient() {
  useRequireAuth(["STAFF", "ADMIN"]);

  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<PaymentResponse | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePayments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý thanh toán
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Tra cứu, theo dõi và đối soát toàn bộ các giao dịch thanh toán trong nhà hàng
          </p>
        </div>
      </div>

      {/* Thông báo xác nhận thanh toán thành công */}
      {successFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thông báo lỗi tải danh sách (nếu có) */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700">
          <div>
            <strong>Lỗi tải danh sách thanh toán:</strong>{" "}
            {getApiErrorMessage(error).message}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-xl font-semibold shadow-2xs hover:bg-red-100/50 transition-colors cursor-pointer"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Bảng Danh sách Giao dịch */}
      <PaymentTable
        payments={payments}
        isLoading={isLoading}
        onViewOrderDetail={(orderId) => setViewingOrderId(orderId)}
        onConfirmPayment={(payment) => setConfirmingPayment(payment)}
        onRefresh={() => refetch()}
      />

      {/* Modal Xem chi tiết đơn hàng tương ứng với giao dịch */}
      <OrderDetailModal
        isOpen={Boolean(viewingOrderId)}
        orderId={viewingOrderId}
        onClose={() => setViewingOrderId(null)}
        onConfirmPayment={(payment) => setConfirmingPayment(payment)}
      />

      {/* Modal Xác nhận thanh toán độc lập */}
      <ConfirmPaymentModal
        isOpen={Boolean(confirmingPayment)}
        payment={confirmingPayment}
        onClose={() => setConfirmingPayment(null)}
        onSuccess={(confirmed) => {
          setSuccessFeedback(
            `Xác nhận thanh toán thành công cho đơn hàng ${confirmed.orderCode} (Mã GD: ${confirmed.transactionCode})`
          );
          setTimeout(() => setSuccessFeedback(null), 5000);
        }}
      />
    </div>
  );
}
