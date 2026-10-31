import type { BadgeVariant } from "@/components/ui/Badge";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export interface PaymentStatusConfigItem {
  label: string;
  variant: BadgeVariant;
  badgeClass: string;
  description: string;
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, PaymentStatusConfigItem> = {
  PENDING: {
    label: "Chờ thanh toán",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/60",
    description: "Giao dịch đang chờ thu tiền hoặc xác nhận",
  },
  SUCCESS: {
    label: "Thanh toán thành công",
    variant: "active",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    description: "Đơn hàng đã hoàn tất thanh toán",
  },
  FAILED: {
    label: "Thanh toán thất bại",
    variant: "inactive",
    badgeClass: "bg-red-50 text-red-700 border-red-200/60",
    description: "Giao dịch thanh toán trước đó đã thất bại",
  },
};

export interface PaymentMethodConfigItem {
  label: string;
  description: string;
}

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, PaymentMethodConfigItem> = {
  CASH: {
    label: "Tiền mặt",
    description: "Thanh toán bằng tiền mặt tại quầy",
  },
  CARD: {
    label: "Thẻ ngân hàng (POS)",
    description: "Quẹt thẻ qua máy thanh toán POS",
  },
  QR: {
    label: "Chuyển khoản QR",
    description: "Quét mã QR chuyển khoản ngân hàng",
  },
};
