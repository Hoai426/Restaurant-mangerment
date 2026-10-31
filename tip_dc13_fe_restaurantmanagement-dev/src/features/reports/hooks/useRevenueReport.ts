import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report.service";
import type { RevenueReportParams, RevenueReportResponse } from "@/types/report";

export function useRevenueReport(params: RevenueReportParams) {
  const isValidRange = Boolean(
    params.startDate &&
    params.endDate &&
    params.startDate <= params.endDate
  );

  return useQuery<RevenueReportResponse, Error>({
    queryKey: ["reports", "revenue", params],
    queryFn: () => reportService.getRevenueReport(params),
    enabled: isValidRange,
    staleTime: 60 * 1000,
  });
}

export default useRevenueReport;
