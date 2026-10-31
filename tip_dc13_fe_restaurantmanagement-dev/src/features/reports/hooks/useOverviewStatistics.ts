import { useQuery } from "@tanstack/react-query";
import type { OverviewStatisticsData, OverviewStatisticsRequest } from "@/types/report";
import { overviewReportService } from "../services/overview-report.service";

export interface UseOverviewStatisticsOptions {
  enabled?: boolean;
}

export function useOverviewStatistics(
  request: OverviewStatisticsRequest,
  { enabled = true }: UseOverviewStatisticsOptions = {}
) {
  return useQuery<OverviewStatisticsData, Error>({
    queryKey: ["reports", "overview", "statistics", request.filters],
    queryFn: () => overviewReportService.getOverviewStatistics(request),
    enabled,
    staleTime: 60 * 1000,
  });
}

export default useOverviewStatistics;
