import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";
import type { CreatePaymentRequest, PaymentResponse } from "@/types/payment";

export interface UseCreatePaymentOptions {
  onSuccess?: (data: PaymentResponse) => void;
  onError?: (err: unknown) => void;
}

export function useCreatePayment(options?: UseCreatePaymentOptions) {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentResponse,
    unknown,
    { orderId: number; payload: CreatePaymentRequest }
  >({
    mutationFn: ({ orderId, payload }) =>
      paymentService.createPayment(orderId, payload),
    onSuccess: (data) => {
      // Invalidate các query có thật và liên quan trực tiếp
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "byOrder", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "list"] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useCreatePayment;
