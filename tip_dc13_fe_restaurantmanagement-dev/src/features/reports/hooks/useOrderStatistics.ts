import { useQuery } from "@tanstack/react-query";
import { orderReportService } from "../services/order-report.service";
import type { OrderStatisticsRequest, OrderStatisticsData } from "@/types/report";

export interface UseOrderStatisticsOptions {
  enabled?: boolean;
}

export function useOrderStatistics(
  request: OrderStatisticsRequest,
  options: UseOrderStatisticsOptions = {}
) {
  const { enabled = true } = options;

  return useQuery<OrderStatisticsData, Error>({
    queryKey: ["reports", "orders", "statistics", request],
    queryFn: () => orderReportService.getOrderStatistics(request),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export default useOrderStatistics;
