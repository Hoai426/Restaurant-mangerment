import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report.service";
import type {
  DailyRevenueReportRequest,
  DailyRevenueReportResponse,
} from "@/types/report";

export function useDailyRevenueReport(request: DailyRevenueReportRequest) {
  return useQuery<DailyRevenueReportResponse, Error>({
    queryKey: ["reports", "revenue", "daily", request],
    queryFn: () => reportService.getDailyRevenueReport(request),
    staleTime: 60 * 1000,
  });
}

export default useDailyRevenueReport;
