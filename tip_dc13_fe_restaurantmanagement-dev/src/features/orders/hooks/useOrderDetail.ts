import { useQuery } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import type { OrderResponse } from "@/types/order";

export interface UseOrderDetailOptions {
  enabled?: boolean;
}

export function useOrderDetail(
  id: number | null | undefined,
  options?: UseOrderDetailOptions
) {
  const isPositiveIntId =
    typeof id === "number" && Number.isInteger(id) && id > 0;

  const isEnabled =
    options?.enabled !== undefined
      ? options.enabled && isPositiveIntId
      : isPositiveIntId;

  return useQuery<OrderResponse, Error>({
    queryKey: ["orders", "detail", id],
    queryFn: () => orderService.getOrderById(id as number),
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

export default useOrderDetail;
