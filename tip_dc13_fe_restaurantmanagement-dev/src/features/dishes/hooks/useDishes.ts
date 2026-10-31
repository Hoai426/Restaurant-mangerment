import { useQuery } from "@tanstack/react-query";
import { dishService } from "../services/dish.service";
import type { SearchRequest } from "@/types/dish";

export function useDishes(searchRequest?: SearchRequest) {
  const request: SearchRequest = searchRequest ?? {};
  return useQuery({
    queryKey: ["dishes", "search", request],
    queryFn: () => dishService.searchDishes(request),
  });
}
