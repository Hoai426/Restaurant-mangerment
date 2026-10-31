import { apiClient } from "@/services/api-client";
import type { TopSellingDishesData, TopSellingDishesRequest } from "@/types/report";

export const topSellingDishesService = {
  async getTopSellingDishes(request: TopSellingDishesRequest): Promise<TopSellingDishesData> {
    return apiClient<TopSellingDishesData>("/api/reports/dishes/top-selling", {
      method: "POST",
      body: request,
    });
  },
};

export default topSellingDishesService;
