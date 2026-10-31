import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import type { CreateOrderRequest, OrderResponse } from "@/types/order";

export interface UseCreateOrderOptions {
  onSuccess?: (data: OrderResponse) => void;
  onError?: (err: unknown) => void;
}

export function useCreateOrder(options?: UseCreateOrderOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => orderService.createOrder(payload),
    onSuccess: (data) => {
      // Invalidate danh sách đơn hàng và trạng thái bàn ăn (bàn chuyển sang OCCUPIED)
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useCreateOrder;
