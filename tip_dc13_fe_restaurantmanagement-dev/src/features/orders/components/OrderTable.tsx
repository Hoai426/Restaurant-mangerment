"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { IconSpinner } from "@/components/common/IconSpinner";
import { ORDER_STATUS_CONFIG, isOrderEditable } from "../constants/order.constants";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { OrderResponse, UpdatableOrderStatus } from "@/types/order";
import {
  EyeIcon,
  PencilSquareIcon,
  CheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  InboxIcon,
  LockClosedIcon,
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

export interface OrderTableProps {
  orders: OrderResponse[];
  isLoading: boolean;
  onViewDetail: (orderId: number) => void;
  onEditOrder: (order: OrderResponse) => void;
  onUpdateStatus: (orderId: number, status: UpdatableOrderStatus) => void;
  onRequestCancel: (order: OrderResponse) => void;
  updatingOrderId?: number | null;
  onPaymentOrder?: (order: OrderResponse) => void;
  createdPaymentOrderIds?: Set<number>;
}

export function OrderTable({
  orders,
  isLoading,
  onViewDetail,
  onEditOrder,
  onUpdateStatus,
  onRequestCancel,
  updatingOrderId = null,
  onPaymentOrder,
  createdPaymentOrderIds,
}: OrderTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      {/* ─── DESKTOP TABLE VIEW (md:block) ─── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 font-semibold tracking-wider uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Mã đơn hàng</th>
              <th className="py-3 px-4">Bàn / Phòng</th>
              <th className="py-3 px-4">Khách & Món</th>
              <th className="py-3 px-4">Thời gian tạo</th>
              <th className="py-3 px-4 text-right">Tổng tiền</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {/* Loading Skeleton */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-gray-200 rounded-md w-28 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-16"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-gray-200 rounded-md w-20"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-gray-200 rounded-md w-28"></div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-gray-200 rounded-md w-20 ml-auto"></div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 bg-gray-200 rounded-full w-20 mx-auto"></div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-6 bg-gray-200 rounded-md w-24 ml-auto"></div>
                  </td>
                </tr>
              ))}

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                      <InboxIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Không tìm thấy đơn hàng nào</p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc hệ thống chưa có đơn.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              orders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status];
                const isEditable = isOrderEditable(order.status);
                const isRowUpdating = updatingOrderId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors group">
                    {/* Cột 1: Mã đơn hàng */}
                    <td className="py-3.5 px-4 align-middle">
                      <button
                        type="button"
                        onClick={() => onViewDetail(order.id)}
                        className="font-mono font-bold text-gray-900 group-hover:text-rms-burgundy transition-colors text-left cursor-pointer focus:outline-hidden focus-visible:underline"
                        aria-label={`Xem chi tiết đơn ${order.orderCode}`}
                      >
                        {order.orderCode}
                      </button>
                      {order.note && (
                        <div className="text-[11px] text-gray-400 italic truncate max-w-xs" title={order.note}>
                          {order.note}
                        </div>
                      )}
                    </td>

                    {/* Cột 2: Bàn / Phòng */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-semibold text-gray-800">
                        {order.tableNumber || `Bàn #${order.tableId}`}
                      </div>
                      {order.roomName && (
                        <div className="text-[11px] text-gray-400">{order.roomName}</div>
                      )}
                    </td>

                    {/* Cột 3: Khách & Món */}
                    <td className="py-3.5 px-4 align-middle text-gray-600">
                      <div>
                        {order.numberOfGuests != null ? `${order.numberOfGuests} khách` : "Chưa ghi nhận"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {order.items?.length ?? 0} món
                      </div>
                    </td>

                    {/* Cột 4: Thời gian tạo */}
                    <td className="py-3.5 px-4 align-middle text-gray-600 font-mono text-[11px]">
                      {formatDateTime(order.createdAt)}
                    </td>

                    {/* Cột 5: Tổng tiền */}
                    <td className="py-3.5 px-4 align-middle text-right font-mono font-bold text-rms-burgundy text-xs">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    {/* Cột 6: Trạng thái */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      {statusConfig && (
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      )}
                    </td>

                    {/* Cột 7: Thao tác */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="inline-flex items-center justify-end gap-1 flex-wrap">
                        {/* 1. Nút Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => onViewDetail(order.id)}
                          className="p-2 min-w-[34px] min-h-[34px] flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rms-gold/50"
                          title="Xem chi tiết đơn hàng"
                          aria-label={`Xem chi tiết đơn ${order.orderCode}`}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {/* 2. Nút Sửa */}
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => onEditOrder(order)}
                            className="p-2 min-w-[34px] min-h-[34px] flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400"
                            title="Chỉnh sửa đơn hàng"
                            aria-label={`Chỉnh sửa đơn ${order.orderCode}`}
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        )}

                        {/* 2.1. Nút Thanh toán */}
                        {isEditable && onPaymentOrder && (
                          <button
                            type="button"
                            disabled={isRowUpdating || createdPaymentOrderIds?.has(order.id)}
                            onClick={() => onPaymentOrder(order)}
                            className={`p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                              createdPaymentOrderIds?.has(order.id)
                                ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                                : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                            title={
                              createdPaymentOrderIds?.has(order.id)
                                ? "Đơn hàng đã được tạo thanh toán trong phiên này"
                                : "Thanh toán đơn hàng"
                            }
                            aria-label={`Thanh toán đơn ${order.orderCode}`}
                          >
                            <BanknotesIcon className="w-4 h-4" />
                          </button>
                        )}

                        {/* 3. Nút Xác nhận đơn */}
                        {order.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={isRowUpdating}
                            onClick={() => onUpdateStatus(order.id, "CONFIRMED")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                            title="Xác nhận đơn hàng"
                            aria-label={`Xác nhận đơn ${order.orderCode}`}
                          >
                            {isRowUpdating ? <IconSpinner /> : <CheckIcon className="w-3.5 h-3.5" />}
                            <span>Xác nhận</span>
                          </button>
                        )}

                        {/* 4. Nút Hoàn tất đơn */}
                        {order.status === "CONFIRMED" && (
                          <button
                            type="button"
                            disabled={isRowUpdating}
                            onClick={() => onUpdateStatus(order.id, "COMPLETED")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                            title="Hoàn tất đơn hàng"
                            aria-label={`Hoàn tất đơn ${order.orderCode}`}
                          >
                            {isRowUpdating ? <IconSpinner /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                            <span>Hoàn tất</span>
                          </button>
                        )}

                        {/* 5. Nút Hủy đơn */}
                        {isEditable && (
                          <button
                            type="button"
                            disabled={isRowUpdating}
                            onClick={() => onRequestCancel(order)}
                            className="p-2 min-w-[34px] min-h-[34px] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                            title="Hủy đơn hàng"
                            aria-label={`Hủy đơn ${order.orderCode}`}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}

                        {/* 6. Trạng thái đóng */}
                        {!isEditable && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 italic px-1">
                            <LockClosedIcon className="w-3 h-3" />
                            <span>Đã đóng</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ─── MOBILE CARD VIEW (md:hidden) ─── */}
      <div className="md:hidden divide-y divide-gray-100">
        {isLoading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`mobile-skeleton-${idx}`} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-5 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}

        {!isLoading && orders.length === 0 && (
          <div className="py-12 px-4 text-center text-gray-400">
            <InboxIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-600">Không tìm thấy đơn hàng</p>
          </div>
        )}

        {!isLoading &&
          orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            const isEditable = isOrderEditable(order.status);
            const isRowUpdating = updatingOrderId === order.id;

            return (
              <div key={`mobile-${order.id}`} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {order.orderCode}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <TableCellsIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{order.tableNumber || `Bàn #${order.tableId}`} {order.roomName ? `(${order.roomName})` : ""}</span>
                    </div>
                  </div>
                  {statusConfig && <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="w-3.5 h-3.5 text-gray-400" />
                      {order.numberOfGuests ?? 0} khách
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rms-burgundy text-sm">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onViewDetail(order.id)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Chi tiết
                  </button>

                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => onEditOrder(order)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Sửa
                    </button>
                  )}

                  {isEditable && onPaymentOrder && (
                    <button
                      type="button"
                      disabled={isRowUpdating || createdPaymentOrderIds?.has(order.id)}
                      onClick={() => onPaymentOrder(order)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Thanh toán
                    </button>
                  )}

                  {order.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={isRowUpdating}
                      onClick={() => onUpdateStatus(order.id, "CONFIRMED")}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isRowUpdating ? <IconSpinner /> : "Xác nhận"}
                    </button>
                  )}

                  {order.status === "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={isRowUpdating}
                      onClick={() => onUpdateStatus(order.id, "COMPLETED")}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isRowUpdating ? <IconSpinner /> : "Hoàn tất"}
                    </button>
                  )}

                  {isEditable && (
                    <button
                      type="button"
                      disabled={isRowUpdating}
                      onClick={() => onRequestCancel(order)}
                      className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default OrderTable;
