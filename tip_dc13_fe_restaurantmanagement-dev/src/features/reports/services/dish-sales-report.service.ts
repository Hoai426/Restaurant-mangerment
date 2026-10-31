import { apiClient } from "@/services/api-client";
import type { DishSalesReportData, DishSalesReportParams } from "@/types/report";

export const dishSalesReportService = {
  async getDishSalesReport(params: DishSalesReportParams): Promise<DishSalesReportData> {
    const query = new URLSearchParams({
      sortBy: params.sortBy,
      direction: params.direction,
      page: String(params.page),
      size: String(params.size),
    });

    return apiClient<DishSalesReportData>(`/api/reports/dishes/sales?${query.toString()}`);
  },
};

export default dishSalesReportService;
