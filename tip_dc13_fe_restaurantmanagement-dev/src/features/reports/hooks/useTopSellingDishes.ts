import { useQuery } from "@tanstack/react-query";
import type { TopSellingDishesData, TopSellingDishesRequest } from "@/types/report";
import { topSellingDishesService } from "../services/top-selling-dishes.service";

export function useTopSellingDishes(request: TopSellingDishesRequest, enabled = true) {
  return useQuery<TopSellingDishesData, Error>({
    queryKey: ["reports", "dishes", "top-selling", request],
    queryFn: () => topSellingDishesService.getTopSellingDishes(request),
    enabled,
    staleTime: 60 * 1000,
  });
}

export default useTopSellingDishes;
