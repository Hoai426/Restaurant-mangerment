import { useQuery } from "@tanstack/react-query";
import { paymentReportService } from "../services/payment-report.service";
import type { PaymentStatisticsData, PaymentStatisticsRequest } from "@/types/report";

export interface UsePaymentStatisticsOptions {
  enabled?: boolean;
}

export function usePaymentStatistics(
  request: PaymentStatisticsRequest,
  { enabled = true }: UsePaymentStatisticsOptions = {}
) {
  return useQuery<PaymentStatisticsData, Error>({
    queryKey: ["reports", "payments", "statistics", request.filters ?? []],
    queryFn: () => paymentReportService.getPaymentStatistics(request),
    enabled,
    staleTime: 60 * 1000,
  });
}

export default usePaymentStatistics;
