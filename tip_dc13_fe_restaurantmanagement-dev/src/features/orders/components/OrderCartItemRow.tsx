"use client";

import React, { useState } from "react";
import type { CartItem } from "@/types/order";
import { formatCurrency } from "@/utils/format";
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface OrderCartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (dishId: number, delta: number) => void;
  onUpdateNote: (dishId: number, note: string) => void;
  onRemove: (dishId: number) => void;
  disabled?: boolean;
}

export function OrderCartItemRow({
  item,
  onUpdateQuantity,
  onUpdateNote,
  onRemove,
  disabled = false,
}: OrderCartItemRowProps) {
  const [showNoteInput, setShowNoteInput] = useState(Boolean(item.note));

  const subtotal = item.price * item.quantity;

  return (
    <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs space-y-1.5 group hover:border-gray-200 transition-all">
      {/* Hàng chính: 3 cụm ngang (Trái: Tên & Giá | Giữa: Số lượng +/- | Phải: Thành tiền & Xóa) */}
      <div className="flex items-center justify-between gap-2">
        {/* 1. Trái: Tên món + Đơn giá */}
        <div className="min-w-0 flex-1">
          <h5
            className="text-xs font-bold text-gray-900 truncate leading-snug"
            title={item.dishName}
          >
            {item.dishName}
          </h5>
          <div className="text-[11px] font-mono text-gray-500 leading-tight">
            {formatCurrency(item.price)}
          </div>
        </div>

        {/* 2. Giữa: Bộ đếm số lượng (+/-) căn giữa */}
        <div className="inline-flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-200/60 shrink-0">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.dishId, -1)}
            disabled={disabled}
            className={`w-5 h-5 flex items-center justify-center rounded bg-white text-gray-600 transition-all shadow-2xs ${
              disabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100 hover:text-gray-900 active:scale-90 cursor-pointer"
            }`}
            aria-label="Giảm 1"
          >
            <MinusIcon className="w-2.5 h-2.5" />
          </button>

          <span className="w-6 text-center font-mono text-xs font-bold text-gray-800">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.dishId, 1)}
            disabled={disabled}
            className={`w-5 h-5 flex items-center justify-center rounded bg-white text-gray-600 transition-all shadow-2xs ${
              disabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100 hover:text-gray-900 active:scale-90 cursor-pointer"
            }`}
            aria-label="Tăng 1"
          >
            <PlusIcon className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* 3. Phải: Thành tiền + Nút xóa */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 min-w-[80px]">
          <span className="font-mono text-xs font-bold text-rms-burgundy">
            {formatCurrency(subtotal)}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(item.dishId)}
              className="text-gray-300 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
              title="Xóa món khỏi đơn"
              aria-label={`Xóa món ${item.dishName}`}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Ghi chú riêng cho món (Thu gọn / Nhỏ gọn) */}
      {(showNoteInput || (!disabled && !showNoteInput)) && (
        <div className="pt-0.5">
          {showNoteInput ? (
            <div className="relative flex items-center">
              <input
                type="text"
                value={item.note ?? ""}
                onChange={(e) => onUpdateNote(item.dishId, e.target.value)}
                placeholder="Ghi chú món (ít đá, không cay...)"
                disabled={disabled}
                className={`w-full text-[10px] pl-2 pr-6 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none transition-all ${
                  disabled
                    ? "cursor-not-allowed opacity-75"
                    : "focus:ring-1 focus:ring-rms-burgundy/30 focus:border-rms-burgundy"
                }`}
              />
              {!disabled && item.note && (
                <button
                  type="button"
                  onClick={() => onUpdateNote(item.dishId, "")}
                  className="absolute right-1 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Xóa ghi chú"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
              {!disabled && !item.note && (
                <button
                  type="button"
                  onClick={() => setShowNoteInput(false)}
                  className="absolute right-1 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Ẩn ghi chú"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            !disabled && (
              <button
                type="button"
                onClick={() => setShowNoteInput(true)}
                className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <ChatBubbleBottomCenterTextIcon className="w-3 h-3" />
                <span>Thêm ghi chú</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default OrderCartItemRow;
