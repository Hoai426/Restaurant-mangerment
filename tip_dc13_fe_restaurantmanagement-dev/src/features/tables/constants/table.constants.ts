import type { BadgeVariant } from "@/components/ui/Badge";
import type { TableStatus } from "@/types/table";
import type { SelectOption } from "@/components/ui/Select";

export interface TableStatusConfigItem {
  label: string;
  description: string;
  variant: BadgeVariant;
}

export const TABLE_STATUS_CONFIG: Record<TableStatus, TableStatusConfigItem> = {
  AVAILABLE: {
    label: "Bàn trống",
    description: "Bàn sạch sẽ, sẵn sàng đón tiếp lượt khách mới",
    variant: "active",
  },
  OCCUPIED: {
    label: "Đang phục vụ",
    description: "Đang có khách ngồi ",
    variant: "warning",
  },
  RESERVED: {
    label: "Đã đặt trước",
    description: "Bàn đã được đặt chỗ trước",
    variant: "info",
  },
};

export const TABLE_STATUS_FILTER_OPTIONS: SelectOption<TableStatus | "ALL">[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "AVAILABLE", label: TABLE_STATUS_CONFIG.AVAILABLE.label },
  { value: "OCCUPIED", label: TABLE_STATUS_CONFIG.OCCUPIED.label },
  { value: "RESERVED", label: TABLE_STATUS_CONFIG.RESERVED.label },
];

export const CAPACITY_FILTER_OPTIONS: SelectOption<number | null>[] = [
  { value: null, label: "Tất cả sức chứa" },
  { value: 2, label: "Từ 2 chỗ trở lên" },
  { value: 4, label: "Từ 4 chỗ trở lên" },
  { value: 6, label: "Từ 6 chỗ trở lên" },
  { value: 8, label: "Từ 8 chỗ trở lên" },
  { value: 10, label: "Từ 10 chỗ trở lên" },
];
