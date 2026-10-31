import type { BadgeVariant } from "@/components/ui/Badge";
import type { OrderStatus, UpdatableOrderStatus } from "@/types/order";
import type { TableStatus } from "@/types/table";

export interface OrderStatusConfigItem {
  label: string;
  variant: BadgeVariant;
  badgeClass: string;
  description: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfigItem> = {
  PENDING: {
    label: "Chờ xử lý",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/60",
    description: "Đơn hàng mới tạo, đang chờ chuyển vào khu vực bếp",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    variant: "active",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    description: "Đơn hàng đã được xác nhận và đang được chuẩn bị",
  },
  COMPLETED: {
    label: "Hoàn tất",
    variant: "neutral",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200/60",
    description: "Khách đã dùng bữa và đơn hàng đã hoàn tất thanh toán",
  },
  CANCELLED: {
    label: "Đã hủy",
    variant: "inactive",
    badgeClass: "bg-red-50 text-red-700 border-red-200/60",
    description: "Đơn hàng đã bị hủy",
  },
};

/**
 * Quy tắc nghiệp vụ kiểm tra bàn có được phép tạo Order không:
 * - AVAILABLE: Bàn trống (cho phép tạo order khi khách mới vào).
 * - OCCUPIED: Bàn đang phục vụ (cho phép tạo order gọi thêm món).
 * - RESERVED: Bàn đã đặt trước (KHÔNG cho phép tạo order trực tiếp).
 */
export function isTableOrderable(status: TableStatus): boolean {
  return status === "AVAILABLE" || status === "OCCUPIED";
}

export const TABLE_ORDERABLE_HELPERS: Record<TableStatus, { canOrder: boolean; reason?: string }> = {
  AVAILABLE: {
    canOrder: true,
  },
  OCCUPIED: {
    canOrder: true,
  },
  RESERVED: {
    canOrder: false,
    reason: "Bàn đã đặt trước, không thể tạo đơn trực tiếp",
  },
};

/**
 * Quy tắc nghiệp vụ kiểm tra trạng thái đơn hàng có được phép chỉnh sửa không (RM-148):
 * - PENDING, CONFIRMED: Được phép chỉnh sửa.
 * - COMPLETED, CANCELLED: Đã hoàn tất hoặc bị hủy, khóa toàn bộ tương tác (Read-Only).
 */
export function isOrderEditable(status: OrderStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

export const ORDER_EDITABLE_HELPERS: Record<OrderStatus, { editable: boolean; reason?: string }> = {
  PENDING: {
    editable: true,
  },
  CONFIRMED: {
    editable: true,
  },
  COMPLETED: {
    editable: false,
    reason: "Đơn hàng đã hoàn tất thanh toán, không thể chỉnh sửa",
  },
  CANCELLED: {
    editable: false,
    reason: "Đơn hàng đã bị hủy, không thể chỉnh sửa",
  },
};

/**
 * Danh sách các trạng thái tiếp theo hợp lệ cho một đơn hàng (RM-150):
 * - PENDING -> CONFIRMED, CANCELLED
 * - CONFIRMED -> COMPLETED, CANCELLED
 * - COMPLETED, CANCELLED -> [] (trạng thái đóng, không cho phép thay đổi)
 */
export function getValidNextStatuses(status: OrderStatus): UpdatableOrderStatus[] {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["COMPLETED", "CANCELLED"];
    case "COMPLETED":
    case "CANCELLED":
    default:
      return [];
  }
}

