import { apiClient } from "@/services/api-client";
import type { OrderStatisticsRequest, OrderStatisticsData } from "@/types/report";

export const orderReportService = {
  /**
   * Lấy thống kê đơn hàng theo trạng thái và khoảng giá trị
   * POST /api/reports/orders/statistics
   */
  async getOrderStatistics(params: OrderStatisticsRequest): Promise<OrderStatisticsData> {
    return apiClient<OrderStatisticsData>("/api/reports/orders/statistics", {
      method: "POST",
      body: params,
    });
  },
};

export default orderReportService;
