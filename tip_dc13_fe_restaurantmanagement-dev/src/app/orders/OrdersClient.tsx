"use client";

import { useState, useCallback, useMemo } from "react";
import {
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CreateOrderModal,
  UpdateOrderModal,
  OrderDetailModal,
  OrderCancelModal,
  OrderFilterBar,
  OrderTable,
  OrderPagination,
  CreatePaymentModal,
  ConfirmPaymentModal,
  useOrders,
  useUpdateOrderStatus,
} from "@/features/orders";
import { Alert } from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type {
  OrderResponse,
  OrderFilterState,
  UpdatableOrderStatus,
} from "@/types/order";
import type { PaymentResponse } from "@/types/payment";

const INITIAL_FILTERS: OrderFilterState = {
  orderCode: "",
  status: "ALL",
  tableId: null,
  createdAt: "",
};

export default function OrdersClient() {
  useRequireAuth(["STAFF", "ADMIN"]);

  // 1. Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderResponse | null>(null);
  const [payingOrder, setPayingOrder] = useState<OrderResponse | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<PaymentResponse | null>(null);
  const [createdPaymentOrderIds, setCreatedPaymentOrderIds] = useState<Set<number>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  // 2. Filter & Pagination States (0-indexed page)
  const [filters, setFilters] = useState<OrderFilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // 3. React Query Hooks
  const debouncedOrderCode = useDebounce(filters.orderCode, 350);
  const activeFilters = useMemo(
    () => ({
      ...filters,
      orderCode: debouncedOrderCode,
    }),
    [filters, debouncedOrderCode]
  );

  const {
    data: ordersPage,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useOrders(activeFilters, page, pageSize);

  const {
    mutate: updateStatusMutation,
    isPending: isUpdatingStatus,
    variables: pendingVariables,
  } = useUpdateOrderStatus({
    onError: (err) => {
      setActionError(getApiErrorMessage(err).message);
    },
    onSuccess: () => {
      setActionError(null);
    },
  });

  // 4. Handlers
  const handleFilterChange = (newFilters: Partial<OrderFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0); // Reset về trang đầu khi đổi bộ lọc
    setActionError(null);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
    setActionError(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleOrderCreated = () => {
    setPage(0); // Chuyển về trang đầu để thấy ngay đơn mới
    setFilters(INITIAL_FILTERS); // Reset bộ lọc để đơn mới không bị ẩn
  };

  const handleUpdateStatus = (orderId: number, targetStatus: UpdatableOrderStatus) => {
    setActionError(null);
    updateStatusMutation({
      id: orderId,
      payload: { status: targetStatus },
    });
  };

  const handleConfirmCancel = (orderId: number) => {
    handleUpdateStatus(orderId, "CANCELLED");
    setCancellingOrder(null);
  };

  const handleOpenPayment = (order: OrderResponse) => {
    setActionError(null);
    setPayingOrder(order);
  };

  const handleClosePayment = () => {
    setPayingOrder(null);
  };

  const handlePaymentSuccess = useCallback((payment: PaymentResponse) => {
    setCreatedPaymentOrderIds((prev) => {
      if (prev.has(payment.orderId)) return prev;
      return new Set(prev).add(payment.orderId);
    });
  }, []);

  const handlePaymentAlreadyExists = useCallback((orderId: number) => {
    setCreatedPaymentOrderIds((prev) => {
      if (prev.has(orderId)) return prev;
      return new Set(prev).add(orderId);
    });
  }, []);

  const orders = ordersPage?.content ?? [];
  const totalElements = ordersPage?.totalElements ?? 0;
  const totalPages = ordersPage?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hệ thống tiếp nhận, tra cứu và điều phối đơn gọi món phục vụ khách tại bàn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:bg-rms-burgundy/95 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Tạo đơn mới</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi thao tác (Action Error Alert) */}
      {actionError && (
        <Alert type="error" message={actionError} />
      )}

      {/* Thông báo lỗi tải danh sách (Query Error Alert) */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700">
          <div>
            <strong>Lỗi tải danh sách đơn hàng:</strong>{" "}
            {getApiErrorMessage(queryError).message}
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

      {/* Thanh Tìm Kiếm & Bộ Lọc Đa Tiêu Chí (RM-150) */}
      <OrderFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        disabled={isLoading}
      />

      {/* Bảng Danh Sách Đơn Hàng (RM-150 Table View Chính) */}
      <OrderTable
        orders={orders}
        isLoading={isLoading}
        onViewDetail={(orderId) => setViewingOrderId(orderId)}
        onEditOrder={(order) => setEditingOrder(order)}
        onUpdateStatus={handleUpdateStatus}
        onRequestCancel={(order) => setCancellingOrder(order)}
        updatingOrderId={isUpdatingStatus ? pendingVariables?.id ?? null : null}
        onPaymentOrder={handleOpenPayment}
        createdPaymentOrderIds={createdPaymentOrderIds}
      />

      {/* Điều Hướng Phân Trang (RM-150 Pagination) */}
      {totalPages > 0 && (
        <OrderPagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disabled={isLoading}
        />
      )}

      {/* Modal Tạo đơn hàng (RM-63) */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleOrderCreated}
      />

      {/* Modal Cập nhật đơn hàng (RM-148) */}
      {editingOrder && (
        <UpdateOrderModal
          isOpen={Boolean(editingOrder)}
          onClose={() => setEditingOrder(null)}
          order={editingOrder}
          onSuccess={() => {
            setEditingOrder(null);
          }}
        />
      )}

      {/* Modal Xem chi tiết đơn hàng (RM-149) */}
      <OrderDetailModal
        isOpen={Boolean(viewingOrderId)}
        orderId={viewingOrderId}
        onClose={() => setViewingOrderId(null)}
        onEdit={(order) => {
          setViewingOrderId(null);
          setEditingOrder(order);
        }}
        onPaymentOrder={handleOpenPayment}
        onConfirmPayment={(payment) => setConfirmingPayment(payment)}
        isPaymentCreatedInSession={Boolean(viewingOrderId && createdPaymentOrderIds.has(viewingOrderId))}
      />

      {/* Modal Xác nhận hủy đơn hàng an toàn (RM-150) */}
      <OrderCancelModal
        isOpen={Boolean(cancellingOrder)}
        order={cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isUpdatingStatus}
      />

      {/* Modal Tạo thanh toán đơn hàng (RM-151) - Layer z-[110] */}
      {payingOrder && (
        <CreatePaymentModal
          key={payingOrder.id}
          isOpen={Boolean(payingOrder)}
          order={payingOrder}
          onClose={handleClosePayment}
          onSuccess={handlePaymentSuccess}
          onPaymentAlreadyExists={handlePaymentAlreadyExists}
        />
      )}

      {/* Modal Xác nhận thanh toán (RM-153) */}
      {confirmingPayment && (
        <ConfirmPaymentModal
          isOpen={Boolean(confirmingPayment)}
          payment={confirmingPayment}
          onClose={() => setConfirmingPayment(null)}
          onSuccess={() => {
            setConfirmingPayment(null);
          }}
        />
      )}
    </div>
  );
}
