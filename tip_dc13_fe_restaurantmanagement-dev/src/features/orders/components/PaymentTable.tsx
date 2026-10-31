"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/utils/format";
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from "../constants/payment.constants";
import type { PaymentResponse, PaymentStatus, PaymentMethod } from "@/types/payment";
import { Select, type SelectOption } from "@/components/ui/Select";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  InboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export interface PaymentTableProps {
  payments: PaymentResponse[];
  isLoading: boolean;
  onViewOrderDetail?: (orderId: number) => void;
  onConfirmPayment?: (payment: PaymentResponse) => void;
  onRefresh?: () => void;
}

const PAYMENT_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ thanh toán (PENDING)" },
  { value: "SUCCESS", label: "Thành công (SUCCESS)" },
  { value: "FAILED", label: "Thất bại (FAILED)" },
];

const PAYMENT_METHOD_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "Tất cả phương thức" },
  { value: "CASH", label: "Tiền mặt (CASH)" },
  { value: "CARD", label: "Thẻ ngân hàng (POS)" },
  { value: "QR", label: "Chuyển khoản QR" },
];

export function PaymentTable({
  payments,
  isLoading,
  onViewOrderDetail,
  onConfirmPayment,
  onRefresh,
}: PaymentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);

  const handleCopy = (txnCode: string) => {
    navigator.clipboard?.writeText(txnCode).then(() => {
      setCopiedTxn(txnCode);
      setTimeout(() => setCopiedTxn(null), 2000);
    });
  };

  // Client-side filtering
  const filteredPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        const createdAtOrder = b.createdAt.localeCompare(a.createdAt);
        return createdAtOrder || b.id - a.id;
      })
      .filter((item) => {
        // 1. Tìm kiếm theo Mã giao dịch hoặc Mã đơn hàng
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (normalizedSearch) {
          const matchTxn = item.transactionCode?.toLowerCase().includes(normalizedSearch);
          const matchOrder = item.orderCode?.toLowerCase().includes(normalizedSearch);
          if (!matchTxn && !matchOrder) return false;
        }

        // 2. Lọc theo trạng thái
        if (statusFilter !== "ALL" && item.status !== statusFilter) {
          return false;
        }

        // 3. Lọc theo phương thức
        if (methodFilter !== "ALL" && item.paymentMethod !== methodFilter) {
          return false;
        }

        return true;
      });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  // Client-side pagination
  const totalElements = filteredPayments.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedPayments = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm & Bộ lọc Client-side */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm mã GD hoặc mã đơn..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-gold focus:ring-2 focus:ring-rms-gold/20 rounded-xl transition-all outline-hidden text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Lọc Trạng thái */}
          <div className="relative w-full h-10 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 rounded-xl transition-all flex items-center">
            <Select<string>
              id="payment-status-filter"
              options={PAYMENT_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              icon={<CheckCircleIcon className="w-4 h-4 text-gray-400" />}
              placeholder="Tất cả trạng thái"
              className="h-full w-full text-xs flex items-center"
            />
          </div>

          {/* Lọc Phương thức */}
          <div className="relative w-full h-10 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white border border-gray-200 focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 rounded-xl transition-all flex items-center">
            <Select<string>
              id="payment-method-filter"
              options={PAYMENT_METHOD_OPTIONS}
              value={methodFilter}
              onChange={(val) => {
                setMethodFilter(val);
                setPage(0);
              }}
              icon={<CreditCardIcon className="w-4 h-4 text-gray-400" />}
              placeholder="Tất cả phương thức"
              className="h-full w-full text-xs flex items-center"
            />
          </div>

          {/* Các nút hành động bộ lọc */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!searchTerm && statusFilter === "ALL" && methodFilter === "ALL"}
              className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <FunnelIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>Đặt lại</span>
            </button>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="h-10 w-10 flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Làm mới danh sách"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tổng kết số lượng kết quả */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Hiển thị <strong>{paginatedPayments.length}</strong> / <strong>{totalElements}</strong> giao dịch
          </span>
          {(searchTerm || statusFilter !== "ALL" || methodFilter !== "ALL") && (
            <span className="text-amber-700 font-medium">
              Đang áp dụng bộ lọc client-side
            </span>
          )}
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 font-semibold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Mã giao dịch</th>
                <th className="py-3 px-4">Mã đơn hàng</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4 text-right">Số tiền</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4">Thời gian tạo</th>
                <th className="py-3 px-4">Thời gian thanh toán</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {/* Skeleton loading */}
              {isLoading && (
                <>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-5 bg-gray-200 rounded-full w-24 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Empty state */}
              {!isLoading && paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                        <InboxIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        Không tìm thấy giao dịch nào
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs">
                        Không có giao dịch thanh toán nào khớp với tiêu chí tìm kiếm hoặc hệ thống chưa có dữ liệu thanh toán.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!isLoading &&
                paginatedPayments.map((item) => {
                  const statusConfig = PAYMENT_STATUS_CONFIG[item.status as PaymentStatus];
                  const methodConfig = PAYMENT_METHOD_CONFIG[item.paymentMethod as PaymentMethod];

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Cột 1: Mã giao dịch */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900 group-hover:text-rms-burgundy transition-colors select-all">
                            {item.transactionCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.transactionCode)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                            title="Sao chép mã giao dịch"
                          >
                            {copiedTxn === item.transactionCode ? (
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Cột 2: Mã đơn hàng */}
                      <td className="py-3.5 px-4 align-middle">
                        {onViewOrderDetail ? (
                          <button
                            type="button"
                            onClick={() => onViewOrderDetail(item.orderId)}
                            className="font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            title="Xem chi tiết đơn hàng này"
                          >
                            {item.orderCode}
                          </button>
                        ) : (
                          <span className="font-mono font-semibold text-gray-800">
                            {item.orderCode}
                          </span>
                        )}
                      </td>

                      {/* Cột 3: Phương thức */}
                      <td className="py-3.5 px-4 align-middle text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <BanknotesIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{methodConfig?.label ?? item.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Cột 4: Số tiền */}
                      <td className="py-3.5 px-4 align-middle text-right font-mono font-bold text-rms-burgundy">
                        {formatCurrency(item.amount)}
                      </td>

                      {/* Cột 5: Trạng thái */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <Badge variant={statusConfig?.variant ?? "neutral"}>
                          {statusConfig?.label ?? item.status}
                        </Badge>
                      </td>

                      {/* Cột 6: Thời gian tạo */}
                      <td className="py-3.5 px-4 align-middle font-mono text-[11px] text-gray-600">
                        {formatDateTime(item.createdAt)}
                      </td>

                      {/* Cột 7: Thời gian thanh toán */}
                      <td className="py-3.5 px-4 align-middle font-mono text-[11px] text-gray-600">
                        {item.paidAt ? formatDateTime(item.paidAt) : "-"}
                      </td>

                      {/* Cột 8: Thao tác */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Nút Xác nhận thanh toán nhanh (chỉ hiển thị khi PENDING) */}
                          {item.status === "PENDING" && onConfirmPayment && (
                            <button
                              type="button"
                              onClick={() => onConfirmPayment(item)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Xác nhận thanh toán giao dịch này"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}

                          {onViewOrderDetail && (
                            <button
                              type="button"
                              onClick={() => onViewOrderDetail(item.orderId)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Xem chi tiết đơn hàng"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Phân trang Client-side */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <span>Số dòng:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-700"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang sau"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentTable;
