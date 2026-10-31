import { apiClient } from "@/services/api-client";
import type { PaymentStatisticsData, PaymentStatisticsRequest } from "@/types/report";

export const paymentReportService = {
  async getPaymentStatistics(
    request: PaymentStatisticsRequest
  ): Promise<PaymentStatisticsData> {
    return apiClient<PaymentStatisticsData>("/api/reports/payments/statistics", {
      method: "POST",
      body: request,
    });
  },
};

export default paymentReportService;
