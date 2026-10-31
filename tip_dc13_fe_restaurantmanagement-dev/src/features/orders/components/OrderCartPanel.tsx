"use client";

import React from "react";
import type { UseOrderCartReturn } from "../hooks/useOrderCart";
import OrderCartItemRow from "./OrderCartItemRow";
import { formatCurrency } from "@/utils/format";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  ShoppingBagIcon,
  TrashIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export interface OrderCartPanelProps {
  cart: UseOrderCartReturn;
  onSubmit: () => void;
  isSubmitting: boolean;
  serverError: string | null;
  isReadOnly?: boolean;
  submitButtonText?: string;
}

export function OrderCartPanel({
  cart,
  onSubmit,
  isSubmitting,
  serverError,
  isReadOnly = false,
  submitButtonText = "Tạo đơn hàng",
}: OrderCartPanelProps) {
  const {
    items,
    selectedTableId,
    numberOfGuests,
    orderNote,
    totalQuantity,
    totalAmount,
    isValid,
    setGuests,
    setOrderNote,
    updateQuantity,
    updateItemNote,
    removeItem,
    clearCart,
  } = cart;

  const hasItems = items.length > 0;

  return (
    <div className="flex flex-col h-full bg-gray-50/60 rounded-2xl border border-gray-100 p-4 justify-between">
      {/* 1. Header Giỏ hàng */}
      <div className="space-y-3 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rms-burgundy/10 text-rms-burgundy flex items-center justify-center font-bold text-xs">
              <ShoppingBagIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                Đơn gọi món
              </h3>
              <span className="text-[11px] text-gray-500">
                {hasItems ? `${totalQuantity} món đã chọn` : "Chưa chọn món"}
              </span>
            </div>
          </div>

          {hasItems && !isReadOnly && (
            <button
              type="button"
              onClick={clearCart}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Xóa toàn bộ giỏ hàng"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Xóa hết</span>
            </button>
          )}
        </div>

        {/* Thông tin số lượng khách & ghi chú chung */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="number"
              min={1}
              value={numberOfGuests ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setGuests(val && val > 0 ? val : undefined);
              }}
              placeholder="Số lượng khách (tùy chọn)"
              disabled={isSubmitting || isReadOnly}
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rms-burgundy/30 focus:border-rms-burgundy disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-2">
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Ghi chú chung cho đơn hàng..."
              disabled={isSubmitting || isReadOnly}
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rms-burgundy/30 focus:border-rms-burgundy disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 2. Danh sách các món trong giỏ (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[340px] pr-1 scrollbar-thin scrollbar-thumb-gray-200">
        {!hasItems ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-2">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-gray-500">
              Chưa có món nào trong đơn
            </p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
              Vui lòng chọn món ăn từ thực đơn bên trái để thêm vào đơn.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <OrderCartItemRow
              key={item.dishId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onUpdateNote={updateItemNote}
              onRemove={removeItem}
              disabled={isReadOnly}
            />
          ))
        )}
      </div>

      {/* 3. Footer Tổng kết & Nút Submit */}
      <div className="pt-3 border-t border-gray-100 space-y-3">
        {/* Banner báo lỗi server (nếu có) */}
        {serverError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-red-500" />
            <span className="line-clamp-2">{serverError}</span>
          </div>
        )}

        {/* Cảnh báo chưa chọn bàn */}
        {!selectedTableId && hasItems && (
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
            <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Vui lòng chọn bàn ăn ở trên trước khi tạo đơn</span>
          </div>
        )}

        {/* Tóm tắt tiền */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Tổng số lượng:</span>
            <span className="font-mono font-semibold text-gray-800">
              {totalQuantity} món
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-1 border-t border-gray-200/50">
            <span className="font-bold text-gray-900 text-sm">Tổng cộng:</span>
            <span className="font-mono text-base sm:text-lg font-bold text-rms-burgundy">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Nút Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting || isReadOnly}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md ${
            !isValid || isSubmitting || isReadOnly
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-rms-gradient hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-rms-burgundy/20"
          }`}
        >
          {isSubmitting ? (
            <>
              <IconSpinner />
              <span>
                {submitButtonText === "Tạo đơn hàng"
                  ? "Đang tạo đơn hàng..."
                  : "Đang lưu thay đổi..."}
              </span>
            </>
          ) : isReadOnly ? (
            <span>Đơn hàng đã khóa (Chỉ xem)</span>
          ) : (
            <>
              <span>{submitButtonText}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default OrderCartPanel;
