import { ORDER_STATUS_CONFIG } from "@/features/orders/constants/order.constants";
import type { OrderStatus } from "@/types/order";
import type { OrderFilterCriteria } from "@/types/report";

export const ORDER_VALUE_RANGE_LABELS: Record<string, string> = {
  "0-200000": "Dưới 200.000 ₫",
  "200000-500000": "200.000 ₫ – 500.000 ₫",
  "500000-1000000": "500.000 ₫ – 1.000.000 ₫",
  "1000000+": "Trên 1.000.000 ₫",
};

export type OrderStatusFilterKey = "ALL" | OrderStatus;

export interface OrderStatusOption {
  key: OrderStatusFilterKey;
  label: string;
}

export const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: ORDER_STATUS_CONFIG.PENDING.label },
  { key: "CONFIRMED", label: ORDER_STATUS_CONFIG.CONFIRMED.label },
  { key: "COMPLETED", label: ORDER_STATUS_CONFIG.COMPLETED.label },
  { key: "CANCELLED", label: ORDER_STATUS_CONFIG.CANCELLED.label },
];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
};

/**
 * Xây dựng mảng FilterCriteria gửi lên Backend theo đúng format Backend yêu cầu
 */
export function buildOrderStatisticsFilters(
  startDate: string,
  endDate: string,
  statusOption: OrderStatusFilterKey
): OrderFilterCriteria[] {
  const filters: OrderFilterCriteria[] = [];

  if (startDate) {
    filters.push({
      field: "createdAt",
      operation: "GTE",
      value: `${startDate}T00:00:00`,
    });
  }

  if (endDate) {
    filters.push({
      field: "createdAt",
      operation: "LTE",
      value: `${endDate}T23:59:59`,
    });
  }

  if (statusOption !== "ALL") {
    filters.push({
      field: "status",
      operation: "IN",
      value: [statusOption],
    });
  }

  return filters;
}

export function formatOrderValueRangeLabel(range: string): string {
  return ORDER_VALUE_RANGE_LABELS[range] || range;
}

export function formatOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_CONFIG[status].label;
}

export function formatOrderStatusLabelLower(status: OrderStatus): string {
  const label = formatOrderStatusLabel(status);
  return label.charAt(0).toLowerCase() + label.slice(1);
}
