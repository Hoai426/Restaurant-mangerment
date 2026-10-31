import { useQuery } from "@tanstack/react-query";
import { dishSalesReportService } from "../services/dish-sales-report.service";
import type { DishSalesReportData, DishSalesReportParams } from "@/types/report";

export function useDishSalesReport(params: DishSalesReportParams) {
  return useQuery<DishSalesReportData, Error>({
    queryKey: ["reports", "dishes", "sales", params],
    queryFn: () => dishSalesReportService.getDishSalesReport(params),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export default useDishSalesReport;
