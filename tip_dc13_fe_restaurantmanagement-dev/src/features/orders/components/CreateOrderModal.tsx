"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  ClipboardDocumentListIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useOrderCart } from "../hooks/useOrderCart";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { OrderTableSelect } from "./OrderTableSelect";
import { OrderMenuCatalog } from "./OrderMenuCatalog";
import { OrderCartPanel } from "./OrderCartPanel";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { OrderResponse } from "@/types/order";

export interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTableId?: number | null;
  onSuccess?: (order: OrderResponse) => void;
}

function CreateOrderModalContent({
  initialTableId,
  onClose,
  onSuccess,
}: Omit<CreateOrderModalProps, "isOpen">) {
  const [serverError, setServerError] = useState<string | null>(null);

  const cart = useOrderCart({ initialTableId: initialTableId ?? null });

  const { mutate: createOrder, isPending } = useCreateOrder({
    onSuccess: (order: OrderResponse) => {
      setServerError(null);
      cart.clearCart();
      onSuccess?.(order);
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
    if (!cart.isValid || !cart.selectedTableId || cart.items.length === 0) {
      return;
    }
    setServerError(null);
    createOrder({
      tableId: cart.selectedTableId,
      numberOfGuests: cart.numberOfGuests,
      note: cart.orderNote?.trim() || undefined,
      items: cart.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price,
        note: item.note?.trim() || undefined,
      })),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      maxWidthClass="max-w-6xl w-full"
      ariaLabelledBy="create-order-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden font-sans border border-gray-100 flex flex-col h-[88vh] max-h-[850px]">
        {/* Header: Tiêu đề + Dropdown Chọn Bàn (Điểm 2 Mentor) + Nút Đóng */}
        <div className="relative z-30 px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center shrink-0">
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="create-order-modal-title"
                  className="text-base sm:text-lg font-bold text-rms-charcoal leading-tight"
                >
                  Tạo đơn gọi món
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Dine-in
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Chọn món và tạo đơn hàng phục vụ tại bàn
              </p>
            </div>
          </div>

          {/* Vị trí chọn bàn trên header (Điểm 2 Mentor) & Nút đóng */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <OrderTableSelect
              selectedTableId={cart.selectedTableId}
              onSelectTable={cart.setTable}
              disabled={isPending}
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

        {/* Body: 2 Columns POS layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Cột trái (7 cols ~58%): Thực đơn món ăn chiếm trọn 100% diện tích dọc (Bỏ bước 1, 2 - Điểm 1 & 2 Mentor) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-100">
            <OrderMenuCatalog
              onAddDish={cart.addItem}
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
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function CreateOrderModal({
  isOpen,
  onClose,
  initialTableId,
  onSuccess,
}: CreateOrderModalProps) {
  if (!isOpen) return null;

  return (
    <CreateOrderModalContent
      initialTableId={initialTableId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

export default CreateOrderModal;
