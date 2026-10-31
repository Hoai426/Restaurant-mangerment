import type { BadgeVariant } from "@/components/ui/Badge";
import type {
  ReservationStatus,
  UpdatableReservationStatus,
} from "@/types/reservation";

export interface ReservationStatusConfigItem {
  label: string;
  variant: BadgeVariant;
  badgeClass: string;
  description: string;
}

export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  ReservationStatusConfigItem
> = {
  PENDING: {
    label: "Chờ xác nhận",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/60",
    description: "Đơn đặt bàn đang chờ nhân viên kiểm tra và xác nhận",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    variant: "active",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    description: "Đơn đặt bàn đã được xác nhận thành công",
  },
  CANCELLED: {
    label: "Đã hủy",
    variant: "inactive",
    badgeClass: "bg-red-50 text-red-700 border-red-200/60",
    description: "Đơn đặt bàn đã bị hủy",
  },
  COMPLETED: {
    label: "Hoàn tất",
    variant: "neutral",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200/60",
    description: "Khách đã đến dùng bữa và thanh toán hoàn tất",
  },
  NO_SHOW: {
    label: "Không đến",
    variant: "inactive",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/60",
    description: "Khách không đến nhận bàn theo lịch hẹn",
  },
};

export interface ReservationStatusActionConfig {
  actionLabel: string;
  actionDescription: string;
  isTerminal: boolean;
  helperWarning?: string;
}

export const RESERVATION_STATUS_ACTION_CONFIG: Record<
  UpdatableReservationStatus,
  ReservationStatusActionConfig
> = {
  CONFIRMED: {
    actionLabel: "Xác nhận đặt bàn",
    actionDescription: "Xác nhận đơn sau khi nhân viên đã kiểm tra khả năng phục vụ.",
    isTerminal: false,
  },
  COMPLETED: {
    actionLabel: "Hoàn tất dùng bữa",
    actionDescription: "Khách đã đến nhà hàng dùng bữa và thanh toán hoàn tất.",
    isTerminal: true,
    helperWarning:
      "Sau khi hoàn tất, đơn đặt bàn sẽ được đóng và các bàn ăn liên quan sẽ được tự động giải phóng.",
  },
  NO_SHOW: {
    actionLabel: "Khách không đến",
    actionDescription: "Khách không đến nhận bàn theo thời gian hẹn.",
    isTerminal: true,
    helperWarning:
      "Đơn đặt bàn sẽ được đóng và các bàn ăn sẽ được tự động giải phóng ngay lập tức.",
  },
  CANCELLED: {
    actionLabel: "Hủy đặt bàn",
    actionDescription: "Hủy đơn đặt bàn theo yêu cầu của khách hoặc do nhà hàng không thể phục vụ.",
    isTerminal: true,
    helperWarning:
      "Đơn đặt bàn sẽ bị hủy vĩnh viễn và các bàn ăn liên quan sẽ được tự động giải phóng.",
  },
};

export function getAllowedTransitions(
  currentStatus: ReservationStatus
): UpdatableReservationStatus[] {
  switch (currentStatus) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
    case "CONFIRMED":
      return ["CANCELLED", "COMPLETED", "NO_SHOW"];
    case "CANCELLED":
    case "COMPLETED":
    case "NO_SHOW":
    default:
      return [];
  }
}

export function isReservationEditable(status: ReservationStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

export const RESERVATION_STATUS_FILTER_OPTIONS: {
  value: ReservationStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: RESERVATION_STATUS_CONFIG.PENDING.label },
  { value: "CONFIRMED", label: RESERVATION_STATUS_CONFIG.CONFIRMED.label },
  { value: "CANCELLED", label: RESERVATION_STATUS_CONFIG.CANCELLED.label },
  { value: "COMPLETED", label: RESERVATION_STATUS_CONFIG.COMPLETED.label },
  { value: "NO_SHOW", label: RESERVATION_STATUS_CONFIG.NO_SHOW.label },
];

export type ReservationSortOptionValue =
  | "created_desc"
  | "created_asc"
  | "reservation_nearest"
  | "reservation_latest";

export interface ReservationSortOption {
  value: ReservationSortOptionValue;
  label: string;
  sorts: Array<{ field: string; direction: "ASC" | "DESC" }>;
}

export const RESERVATION_SORT_OPTIONS: ReservationSortOption[] = [
  {
    value: "created_desc",
    label: "Mới tạo nhất",
    sorts: [{ field: "createdAt", direction: "DESC" }],
  },
  {
    value: "created_asc",
    label: "Cũ nhất",
    sorts: [{ field: "createdAt", direction: "ASC" }],
  },
  {
    value: "reservation_nearest",
    label: "Ngày đặt gần nhất",
    sorts: [
      { field: "reservationDate", direction: "ASC" },
      { field: "startTime", direction: "ASC" },
    ],
  },
  {
    value: "reservation_latest",
    label: "Ngày đặt xa nhất",
    sorts: [
      { field: "reservationDate", direction: "DESC" },
      { field: "startTime", direction: "DESC" },
    ],
  },
];

export const PAGE_SIZE_OPTIONS: number[] = [10, 20, 50];


