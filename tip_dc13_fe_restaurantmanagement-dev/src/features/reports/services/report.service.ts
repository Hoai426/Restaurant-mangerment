import { apiClient } from "@/services/api-client";
import type {
  DailyRevenueReportRequest,
  DailyRevenueReportResponse,
  RevenueReportParams,
  RevenueReportResponse,
} from "@/types/report";

export const reportService = {
  /**
   * Lấy báo cáo doanh thu theo khoảng thời gian
   * GET /api/reports/revenue?startDate=...&endDate=...&groupBy=...
   */
  async getRevenueReport(params: RevenueReportParams): Promise<RevenueReportResponse> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    if (params.groupBy) {
      queryParams.append("groupBy", params.groupBy);
    }

    return apiClient<RevenueReportResponse>(`/api/reports/revenue?${queryParams.toString()}`);
  },

  async getDailyRevenueReport(
    request: DailyRevenueReportRequest
  ): Promise<DailyRevenueReportResponse> {
    return apiClient<DailyRevenueReportResponse>("/api/reports/revenue/daily", {
      method: "POST",
      body: request,
    });
  },
};
