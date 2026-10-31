"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useOrderCart } from "../hooks/useOrderCart";
import { useUpdateOrder } from "../hooks/useUpdateOrder";
import { OrderTableSelect } from "./OrderTableSelect";
import { OrderMenuCatalog } from "./OrderMenuCatalog";
import { OrderCartPanel } from "./OrderCartPanel";
import {
  ORDER_STATUS_CONFIG,
  isOrderEditable,
  ORDER_EDITABLE_HELPERS,
} from "../constants/order.constants";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { OrderResponse, UpdateOrderRequest, OrderCartInitialData } from "@/types/order";
import {
  PencilSquareIcon,
  XMarkIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export interface UpdateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse;
  onSuccess?: (updatedOrder: OrderResponse) => void;
}

function UpdateOrderModalContent({
  order,
  onClose,
  onSuccess,
}: Omit<UpdateOrderModalProps, "isOpen">) {
  const [serverError, setServerError] = useState<string | null>(null);

  const isReadOnly = !isOrderEditable(order.status);
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const lockReason = ORDER_EDITABLE_HELPERS[order.status]?.reason;

  // Chuẩn bị snapshot dữ liệu giỏ hàng ban đầu từ order
  const initialCartData: OrderCartInitialData = useMemo(() => {
    return {
      tableId: order.tableId,
      numberOfGuests: order.numberOfGuests,
      orderNote: order.note,
      items: order.items.map((item) => ({
        dishId: item.dishId,
        dishName: item.dishName,
        price: item.price,
        quantity: item.quantity,
        note: item.note ?? undefined,
        isAvailable: true,
      })),
    };
  }, [order]);

  const cart = useOrderCart({ initialData: initialCartData });

  const { mutate: updateOrder, isPending } = useUpdateOrder({
    onSuccess: (updatedOrder: OrderResponse) => {
      setServerError(null);
      onSuccess?.(updatedOrder);
      onClose();
    },
    onError: (err: unknown) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleClose = () => {
    if (isPending) return;
    setServerError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (isReadOnly || !cart.selectedTableId || cart.items.length === 0) {
      return;
    }
    setServerError(null);

    // Full Snapshot Serialization:
    // - tableId: chỉ gửi khi chuyển đơn sang bàn khác
    // - numberOfGuests: number hoặc null (nếu xóa trống)
    // - note: string hoặc null (nếu xóa trống)
    // - items: danh sách món, tuyệt đối KHÔNG chứa price
    const payload: UpdateOrderRequest = {
      ...(cart.selectedTableId !== order.tableId
        ? { tableId: cart.selectedTableId }
        : {}),
      numberOfGuests:
        cart.numberOfGuests !== undefined && cart.numberOfGuests > 0
          ? cart.numberOfGuests
          : null,
      note: cart.orderNote?.trim() ? cart.orderNote.trim() : null,
      items: cart.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        note: item.note?.trim() ? item.note.trim() : null,
      })),
    };

    updateOrder({ id: order.id, payload });
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      maxWidthClass="max-w-6xl w-full"
      ariaLabelledBy="update-order-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden font-sans border border-gray-100 flex flex-col h-[88vh] max-h-[850px]">
        {/* Header: Thông tin đơn + Dropdown Bàn + Badge Trạng thái + Nút Đóng */}
        <div className="relative z-30 px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isReadOnly
                  ? "bg-gray-100 text-gray-500"
                  : "bg-rms-burgundy/10 text-rms-burgundy"
              }`}
            >
              {isReadOnly ? (
                <LockClosedIcon className="w-5 h-5" />
              ) : (
                <PencilSquareIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="update-order-modal-title"
                  className="text-base sm:text-lg font-bold text-rms-charcoal leading-tight"
                >
                  {isReadOnly ? "Chi tiết đơn hàng" : "Cập nhật đơn hàng"}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white text-gray-800 border border-gray-300">
                  {order.orderCode}
                </span>
                <Badge variant={statusConfig.variant} className="text-[11px] font-semibold">
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Bàn hiện tại: <strong className="text-gray-700">{order.tableNumber}</strong>
                {order.roomName ? ` (${order.roomName})` : ""}
              </p>
            </div>
          </div>

          {/* Vị trí chọn bàn trên header & Nút đóng */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <OrderTableSelect
              selectedTableId={cart.selectedTableId}
              onSelectTable={cart.setTable}
              disabled={isPending || isReadOnly}
            />

            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Đóng cửa sổ"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner cảnh báo nếu đơn hàng ở chế độ Read-Only */}
        {isReadOnly && (
          <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200/80 text-gray-600 text-xs flex items-center gap-2 shrink-0">
            <ExclamationCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lockReason ?? "Đơn hàng đã khóa. Bạn chỉ có thể xem chi tiết thông tin đơn hàng."}
            </span>
          </div>
        )}

        {/* Body: 2 Columns POS layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Cột trái (7 cols ~58%): Thực đơn món ăn */}
          <div
            className={`lg:col-span-7 flex flex-col overflow-hidden p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-100 ${
              isReadOnly ? "opacity-60 pointer-events-none select-none bg-gray-50/20" : ""
            }`}
          >
            <OrderMenuCatalog
              onAddDish={isReadOnly ? () => {} : cart.addItem}
              getItemQuantity={cart.getItemQuantity}
            />
          </div>

          {/* Cột phải (5 cols ~42%): Giỏ hàng đơn gọi món */}
          <div className="lg:col-span-5 flex flex-col overflow-hidden p-4 sm:p-5 bg-gray-50/40">
            <OrderCartPanel
              cart={cart}
              onSubmit={handleSubmit}
              isSubmitting={isPending}
              serverError={serverError}
              isReadOnly={isReadOnly}
              submitButtonText="Lưu thay đổi"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function UpdateOrderModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: UpdateOrderModalProps) {
  if (!isOpen || !order) return null;

  return (
    <UpdateOrderModalContent
      key={order.id}
      order={order}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

export default UpdateOrderModal;
