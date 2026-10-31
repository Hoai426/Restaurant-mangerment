import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";
import { ApiError } from "@/services/api-client";
import type { ConfirmPaymentRequest, PaymentResponse } from "@/types/payment";

export interface UseConfirmPaymentOptions {
  onSuccess?: (data: PaymentResponse) => void;
  onError?: (err: unknown) => void;
}

export function useConfirmPayment(options?: UseConfirmPaymentOptions) {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentResponse,
    unknown,
    { orderId: number; payload?: ConfirmPaymentRequest }
  >({
    mutationFn: ({ orderId, payload = { status: "SUCCESS" } }) =>
      paymentService.confirmPayment(orderId, payload),
    onSuccess: (data) => {
      // 1. Invalidate dữ liệu payment
      queryClient.invalidateQueries({ queryKey: ["payments", "byOrder", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "list"] });

      // 2. Invalidate dữ liệu đơn hàng (chuyển sang COMPLETED)
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", data.orderId] });

      // 3. Invalidate trạng thái bàn ăn (để cập nhật sơ đồ bàn)
      queryClient.invalidateQueries({ queryKey: ["tables"] });

      options?.onSuccess?.(data);
    },
    onError: async (err, variables) => {
      // Tự động invalidate toàn diện khi gặp xung đột 409 PAYMENT_ALREADY_PROCESSED
      if (
        err instanceof ApiError &&
        (err.errorCode === "PAYMENT_ALREADY_PROCESSED" ||
          err.code === "PAYMENT_ALREADY_PROCESSED")
      ) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["payments", "byOrder", variables.orderId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["payments", "list"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["orders", "detail", variables.orderId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["orders", "list"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tables"],
          }),
        ]);
      }

      options?.onError?.(err);
    },
  });
}

export default useConfirmPayment;
