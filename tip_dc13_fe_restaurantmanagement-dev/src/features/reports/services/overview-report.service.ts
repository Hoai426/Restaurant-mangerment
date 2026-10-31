import { apiClient } from "@/services/api-client";
import type { OverviewStatisticsData, OverviewStatisticsRequest } from "@/types/report";

export const overviewReportService = {
  async getOverviewStatistics(
    request: OverviewStatisticsRequest
  ): Promise<OverviewStatisticsData> {
    return apiClient<OverviewStatisticsData>("/api/reports/overview", {
      method: "POST",
      body: request,
    });
  },
};

export default overviewReportService;
