"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { usePaymentByOrderId } from "../hooks/usePaymentByOrderId";
import {
  ORDER_STATUS_CONFIG,
  isOrderEditable,
  ORDER_EDITABLE_HELPERS,
} from "../constants/order.constants";
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from "../constants/payment.constants";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { OrderDetailModalProps } from "@/types/order";
import {
  ClipboardDocumentListIcon,
  XMarkIcon,
  TableCellsIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  LockClosedIcon,
  BanknotesIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ConfirmPaymentModal } from "./ConfirmPaymentModal";

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onEdit,
  onPaymentOrder,
  onConfirmPayment,
  isPaymentCreatedInSession = false,
}: OrderDetailModalProps) {
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderDetail(orderId, { enabled: isOpen });

  const {
    data: payment,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
    error: paymentError,
    refetch: refetchPayment,
  } = usePaymentByOrderId(orderId, { enabled: isOpen });

  if (!isOpen) return null;

  const statusConfig = order ? ORDER_STATUS_CONFIG[order.status] : null;
  const isEditable = order ? isOrderEditable(order.status) : false;
  const lockReason = order ? ORDER_EDITABLE_HELPERS[order.status]?.reason : null;

  const totalQuantity =
    order?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;

  const handleCopyTxn = (txnCode: string) => {
    navigator.clipboard?.writeText(txnCode).then(() => {
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    });
  };

  // Trạng thái nút thanh toán
  const hasExistingPayment = Boolean(payment);
  const isPaymentButtonDisabled =
    isPaymentLoading ||
    isPaymentCreatedInSession ||
    hasExistingPayment;

  const getPaymentButtonLabel = () => {
    if (isPaymentLoading) return "Đang kiểm tra...";
    if (payment) {
      if (payment.status === "PENDING") return "Đã tạo thanh toán";
      if (payment.status === "SUCCESS") return "Đã hoàn tất thanh toán";
      if (payment.status === "FAILED") return "Thanh toán thất bại";
    }
    if (isPaymentCreatedInSession) return "Đã tạo thanh toán";
    return "Thanh toán";
  };

  const getPaymentButtonTitle = () => {
    if (isPaymentLoading) return "Đang kiểm tra trạng thái thanh toán...";
    if (payment) {
      if (payment.status === "PENDING") {
        return "Đơn hàng đã có giao dịch thanh toán đang chờ xử lý";
      }
      if (payment.status === "SUCCESS") {
        return "Đơn hàng đã được thanh toán thành công";
      }
      if (payment.status === "FAILED") {
        return "Giao dịch thanh toán đã thất bại. Mỗi đơn hàng chỉ liên kết một thanh toán";
      }
    }
    if (isPaymentCreatedInSession) {
      return "Đơn hàng đã được tạo thanh toán trong phiên này";
    }
    return "Thanh toán đơn hàng";
  };

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      ariaLabelledBy="order-detail-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="order-detail-modal-title"
                  className="text-lg font-bold text-gray-900 tracking-tight"
                >
                  Chi tiết đơn gọi món
                </h2>
                {statusConfig && (
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
              {order && (
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Mã đơn: <span className="font-semibold text-gray-700">{order.orderCode}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* State 1: Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
              <div className="text-rms-burgundy">
                <IconSpinner />
              </div>
              <p className="text-sm font-medium">Đang tải thông tin đơn hàng...</p>
            </div>
          )}

          {/* State 2: Error */}
          {isError && (
            <div className="py-6 space-y-4">
              <Alert
                type="error"
                message={getApiErrorMessage(error).message}
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rms-burgundy bg-rms-burgundy/10 hover:bg-rms-burgundy/20 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {/* State 3: Data Loaded */}
          {!isLoading && !isError && order && (
            <>
              {/* Thẻ thông tin tổng quan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/70 rounded-xl border border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-2.5">
                  <TableCellsIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Bàn:{" "}
                    <strong className="text-gray-900 font-semibold">
                      {order.tableNumber || `#${order.tableId}`}
                    </strong>
                    {order.roomName ? ` • Phòng ${order.roomName}` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <UserGroupIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Số lượng khách:{" "}
                    <strong className="text-gray-900 font-semibold">
                      {order.numberOfGuests != null ? `${order.numberOfGuests} khách` : "Chưa ghi nhận"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Tạo lúc:{" "}
                    <strong className="text-gray-800 font-medium font-mono">
                      {formatDateTime(order.createdAt)}
                    </strong>
                  </span>
                </div>

                {order.updatedAt && (
                  <div className="flex items-center gap-2.5">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      Cập nhật:{" "}
                      <strong className="text-gray-800 font-medium font-mono">
                        {formatDateTime(order.updatedAt)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Ghi chú chung của đơn hàng (nếu có) */}
              {order.note && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-950">Ghi chú đơn hàng: </span>
                    <span className="italic">{order.note}</span>
                  </div>
                </div>
              )}

              {/* Bảng danh sách món ăn */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Danh sách món ăn ({order.items?.length ?? 0} món)
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">
                    Tổng: {totalQuantity} suất
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50/90 text-gray-500 sticky top-0 z-10 border-b border-gray-200 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3.5">Món ăn</th>
                          <th className="py-2.5 px-3 text-right">Đơn giá</th>
                          <th className="py-2.5 px-3 text-center">SL</th>
                          <th className="py-2.5 px-3.5 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <tr key={item.id ?? `${item.dishId}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-2.5 px-3.5 align-top">
                                <div className="font-semibold text-gray-900">
                                  {item.dishName}
                                </div>
                                {item.note && (
                                  <div className="text-[11px] text-gray-500 italic mt-0.5">
                                    Ghi chú: {item.note}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right text-gray-600 align-top font-mono">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="py-2.5 px-3 text-center align-top">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-semibold font-mono text-[11px]">
                                  x{item.quantity}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-semibold text-gray-900 align-top font-mono">
                                {formatCurrency(item.subtotal)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                              Đơn hàng chưa có món ăn nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Khối Tổng kết tiền */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block font-medium">Tổng thanh toán</span>
                  <span className="text-[11px] text-gray-400">Đã bao gồm toàn bộ món và dịch vụ</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-rms-burgundy font-mono tracking-tight">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Khối Thông tin thanh toán (RM-152) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Thông tin thanh toán
                  </h3>
                  {payment && (
                    <Badge variant={PAYMENT_STATUS_CONFIG[payment.status]?.variant ?? "warning"}>
                      {PAYMENT_STATUS_CONFIG[payment.status]?.label ?? payment.status}
                    </Badge>
                  )}
                </div>

                {/* State: Đang tải thanh toán */}
                {isPaymentLoading && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <IconSpinner />
                    <span>Đang kiểm tra giao dịch thanh toán...</span>
                  </div>
                )}

                {/* State: Lỗi khi tải thanh toán */}
                {!isPaymentLoading && isPaymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs text-red-700">
                    <span>{getApiErrorMessage(paymentError).message}</span>
                    <button
                      type="button"
                      onClick={() => refetchPayment()}
                      className="inline-flex items-center gap-1 font-semibold text-red-800 hover:underline cursor-pointer"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                      <span>Thử lại</span>
                    </button>
                  </div>
                )}

                {/* State: Đã có thanh toán */}
                {!isPaymentLoading && !isPaymentError && payment && (
                  <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Mã giao dịch:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900 select-all">
                          {payment.transactionCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTxn(payment.transactionCode)}
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
                      <span className="font-semibold text-gray-800">
                        {PAYMENT_METHOD_CONFIG[payment.paymentMethod]?.label ?? payment.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Thời gian tạo:</span>
                      <span className="font-mono text-gray-700">
                        {formatDateTime(payment.createdAt)}
                      </span>
                    </div>

                    {payment.paidAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Thời gian thanh toán:</span>
                        <span className="font-mono text-gray-700">
                          {formatDateTime(payment.paidAt)}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Số tiền giao dịch:</span>
                      <span className="font-mono font-bold text-rms-burgundy">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* State: Chưa có thanh toán */}
                {!isPaymentLoading && !isPaymentError && !payment && (
                  <div className="p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                    <span>Đơn hàng chưa có giao dịch thanh toán nào.</span>
                    <span className="text-[11px] font-semibold text-gray-400">Chưa thanh toán</span>
                  </div>
                )}
              </div>

              {/* Thông báo khóa chỉnh sửa (nếu trạng thái đã hoàn tất hoặc hủy) */}
              {!isEditable && lockReason && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{lockReason}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {/* Nút Xác nhận thanh toán (duy nhất 1 nút hành động khi payment đang PENDING) */}
            {payment && payment.status === "PENDING" && isEditable && (
              <button
                type="button"
                onClick={() => {
                  if (onConfirmPayment) {
                    onConfirmPayment(payment);
                  } else {
                    setIsConfirmModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Xác nhận thanh toán cho đơn hàng này"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Xác nhận thanh toán</span>
              </button>
            )}

            {/* Nút Tạo thanh toán (khi đơn chưa có giao dịch nào) */}
            {!payment && isEditable && onPaymentOrder && order && (
              <button
                type="button"
                disabled={isPaymentButtonDisabled}
                onClick={() => {
                  onPaymentOrder(order);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  isPaymentButtonDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs hover:shadow-xs"
                }`}
                title={getPaymentButtonTitle()}
              >
                <BanknotesIcon className="w-4 h-4" />
                <span>{getPaymentButtonLabel()}</span>
              </button>
            )}

            {isEditable && onEdit && order && (
              <button
                type="button"
                onClick={() => {
                  onEdit(order);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:bg-rms-burgundy/95 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Chỉnh sửa đơn hàng</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>

    {/* Modal Xác nhận thanh toán (Portal z-[110]) */}
    {payment && (
      <ConfirmPaymentModal
        isOpen={isConfirmModalOpen}
        payment={payment}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    )}
    </>
  );
}

export default OrderDetailModal;
