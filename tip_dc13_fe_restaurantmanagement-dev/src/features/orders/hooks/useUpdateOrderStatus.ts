import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import type { UpdateOrderStatusRequest, OrderResponse } from "@/types/order";

export interface UseUpdateOrderStatusOptions {
  onSuccess?: (data: OrderResponse) => void;
  onError?: (err: unknown) => void;
}

export function useUpdateOrderStatus(options?: UseUpdateOrderStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, { id: number; payload: UpdateOrderStatusRequest }>({
    mutationFn: ({ id, payload }) => orderService.updateOrderStatus(id, payload),
    onSuccess: (data) => {
      // Invalidate đồng bộ danh sách đơn hàng, chi tiết đơn vừa đổi, và danh sách bàn (nếu bàn được giải phóng)
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", data.id] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useUpdateOrderStatus;
