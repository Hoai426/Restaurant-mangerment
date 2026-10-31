import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";
import { ApiError } from "@/services/api-client";
import type { PaymentResponse } from "@/types/payment";

export interface UsePaymentByOrderIdOptions {
  enabled?: boolean;
}

export function usePaymentByOrderId(
  orderId: number | null | undefined,
  options?: UsePaymentByOrderIdOptions
) {
  const isValidId =
    typeof orderId === "number" && Number.isInteger(orderId) && orderId > 0;

  const isEnabled =
    options?.enabled !== undefined ? options.enabled && isValidId : isValidId;

  return useQuery<PaymentResponse | null, Error>({
    queryKey: ["payments", "byOrder", orderId],
    queryFn: async () => {
      try {
        return await paymentService.getPaymentByOrderId(orderId as number);
      } catch (err) {
        if (
          err instanceof ApiError &&
          err.status === 404 &&
          (err.errorCode === "PAYMENT_NOT_FOUND" || err.code === "PAYMENT_NOT_FOUND")
        ) {
          // Đơn hàng hợp lệ nhưng chưa có giao dịch thanh toán nào
          return null;
        }
        // Các lỗi khác (ORDER_NOT_FOUND, 401, 403, 500) quăng tiếp cho UI xử lý
        throw err;
      }
    },
    enabled: isEnabled,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 401 || error.status === 403)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30 * 1000,
  });
}

export default usePaymentByOrderId;
