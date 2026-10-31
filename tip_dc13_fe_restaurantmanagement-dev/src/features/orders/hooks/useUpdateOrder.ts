import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import type { UpdateOrderRequest, OrderResponse } from "@/types/order";

export interface UseUpdateOrderOptions {
  onSuccess?: (data: OrderResponse) => void;
  onError?: (err: unknown) => void;
}

export function useUpdateOrder(options?: UseUpdateOrderOptions) {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, { id: number; payload: UpdateOrderRequest }>({
    mutationFn: ({ id, payload }) => orderService.updateOrder(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", data.id] });
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useUpdateOrder;
