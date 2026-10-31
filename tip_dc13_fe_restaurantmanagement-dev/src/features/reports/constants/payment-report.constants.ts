import { addDays, format, parse } from "date-fns";
import type {
  PaymentStatisticsByMethod,
  PaymentStatisticsByStatus,
  PaymentStatisticsFilter,
} from "@/types/report";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export const PAYMENT_METHOD_ORDER: PaymentMethod[] = ["CASH", "CARD", "QR"];
export const PAYMENT_STATUS_ORDER: PaymentStatus[] = ["PENDING", "SUCCESS", "FAILED"];

export function buildPaymentStatisticsFilters(
  startDate: string,
  endDate: string
): PaymentStatisticsFilter[] {
  const filters: PaymentStatisticsFilter[] = [];

  if (startDate) {
    filters.push({
      field: "createdAt",
      value: `${startDate}T00:00:00`,
      operation: "GTE",
    });
  }

  if (endDate) {
    const localDate = parse(endDate, "yyyy-MM-dd", new Date());
    const nextDate = format(addDays(localDate, 1), "yyyy-MM-dd");
    filters.push({
      field: "createdAt",
      value: `${nextDate}T00:00:00`,
      operation: "LT",
    });
  }

  return filters;
}

export function mapPaymentMethods(
  items: PaymentStatisticsByMethod[] | undefined
): PaymentStatisticsByMethod[] {
  return PAYMENT_METHOD_ORDER.map((method) => {
    const item = items?.find((entry) => entry.method === method);
    return item ?? { method, paymentCount: 0, totalAmount: 0 };
  });
}

export function mapPaymentStatuses(
  items: PaymentStatisticsByStatus[] | undefined
): PaymentStatisticsByStatus[] {
  return PAYMENT_STATUS_ORDER.map((status) => {
    const item = items?.find((entry) => entry.status === status);
    return item ?? { status, paymentCount: 0, totalAmount: 0 };
  });
}
