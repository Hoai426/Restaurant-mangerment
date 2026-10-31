"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { IconSpinner } from "@/components/common/IconSpinner";
import { formatCurrency } from "@/utils/format";
import type { OrderResponse } from "@/types/order";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface OrderCancelModalProps {
  isOpen: boolean;
  order: OrderResponse | null;
  onClose: () => void;
  onConfirm: (orderId: number) => void;
  isLoading?: boolean;
}

export function OrderCancelModal({
  isOpen,
  order,
  onClose,
  onConfirm,
  isLoading = false,
}: OrderCancelModalProps) {
  if (!isOpen || !order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      maxWidthClass="max-w-md"
      ariaLabelledBy="order-cancel-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="order-cancel-modal-title"
                className="text-base font-bold text-gray-900"
              >
                Xác nhận hủy đơn hàng
              </h2>
              <p className="text-xs text-red-600 font-medium mt-0.5">
                Thao tác này không thể hoàn tác
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            title="Đóng modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-gray-600">
          <p className="text-gray-700 text-sm">
            Bạn có chắc chắn muốn hủy đơn hàng{" "}
            <strong className="font-mono text-gray-900 font-bold">{order.orderCode}</strong>{" "}
            không?
          </p>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Bàn phục vụ:</span>
              <span className="font-semibold text-gray-900">
                {order.tableNumber || `#${order.tableId}`}
                {order.roomName ? ` (${order.roomName})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số lượng món:</span>
              <span className="font-medium text-gray-800">
                {order.items?.length ?? 0} món
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200/60 pt-2">
              <span className="text-gray-500">Tổng tiền:</span>
              <span className="font-bold text-red-700 font-mono text-sm">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-800 text-[11px] leading-relaxed">
            <strong>Lưu ý:</strong> Bàn ăn sẽ được tự động giải phóng về trạng thái trống (nếu không còn đơn hàng nào khác đang phục vụ tại bàn). Đơn đã thanh toán thành công sẽ không thể hủy.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Không, quay lại
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm(order.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading && <IconSpinner />}
            <span>Xác nhận hủy đơn</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default OrderCancelModal;
